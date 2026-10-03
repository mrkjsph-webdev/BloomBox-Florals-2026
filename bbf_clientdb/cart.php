<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "client_db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON request."
    ]);
    exit;
}

$action = $data["action"] ?? null;
$client_id = $data["client_id"] ?? null;

if (!$action) {
    echo json_encode([
        "success" => false,
        "message" => "Cart action is missing."
    ]);
    exit;
}

if (!$client_id) {
    echo json_encode([
        "success" => false,
        "message" => "Client ID is missing."
    ]);
    exit;
}

try {

    /*
     * =========================================================
     * GET CART
     * =========================================================
     *
     * Only normal cart items are returned.
     *
     * is_selected = 0
     * AND
     * order_id IS NULL
     *
     * A pending GCash order therefore stays in the database
     * but does not appear in the customer's cart.
     */

    if ($action === "get") {

        $stmt = $conn->prepare("
            SELECT cart_id
            FROM shopping_cart
            WHERE client_id = ?
            AND cart_status = 'active'
            ORDER BY cart_id DESC
            LIMIT 1
        ");

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare cart lookup: " .
                    $conn->error
            );
        }

        $stmt->bind_param("i", $client_id);

        if (!$stmt->execute()) {
            throw new Exception(
                "Failed to retrieve cart: " .
                    $stmt->error
            );
        }

        $result = $stmt->get_result();

        if ($result->num_rows === 0) {

            echo json_encode([
                "success" => true,
                "cart_id" => null,
                "items" => []
            ]);

            exit;
        }

        $cart = $result->fetch_assoc();
        $cart_id = (int) $cart["cart_id"];

        $stmt->close();

        $stmt = $conn->prepare("
            SELECT
                item_id,
                cart_id,
                flower_id,
                quantity,
                added_at,
                unit_price,
                customization,
                is_selected,
                order_id
            FROM shopping_cart_items
            WHERE cart_id = ?
            AND is_selected = 0
            AND order_id IS NULL
            ORDER BY item_id ASC
        ");

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare cart items query: " .
                    $conn->error
            );
        }

        $stmt->bind_param("i", $cart_id);

        if (!$stmt->execute()) {
            throw new Exception(
                "Failed to retrieve cart items: " .
                    $stmt->error
            );
        }

        $result = $stmt->get_result();

        $items = [];

        while ($row = $result->fetch_assoc()) {

            $customization = [];

            if (!empty($row["customization"])) {

                $decoded = json_decode(
                    $row["customization"],
                    true
                );

                if (is_array($decoded)) {
                    $customization = $decoded;
                }
            }

            $flower_name = "Flower";

            if (
                isset($customization["flowers"]) &&
                is_array($customization["flowers"]) &&
                isset($customization["flowers"][0]["name"])
            ) {
                $flower_name =
                    $customization["flowers"][0]["name"];
            }

            $items[] = [
                "id" => (int) $row["item_id"],

                "item_id" =>
                    (int) $row["item_id"],

                "cart_id" =>
                    (int) $row["cart_id"],

                "flower_id" =>
                    $row["flower_id"] !== null
                        ? (int) $row["flower_id"]
                        : null,

                "quantity" =>
                    (int) $row["quantity"],

                "price" =>
                    (float) $row["unit_price"],

                "unit_price" =>
                    (float) $row["unit_price"],

                "name" => $flower_name,

                "image" => null,

                "category" => "Flower",

                "customization" =>
                    $customization,

                "added_at" =>
                    $row["added_at"],

                "is_selected" =>
                    (int) $row["is_selected"],

                "order_id" =>
                    $row["order_id"] !== null
                        ? (int) $row["order_id"]
                        : null
            ];
        }

        $stmt->close();

        echo json_encode([
            "success" => true,
            "cart_id" => $cart_id,
            "items" => $items
        ]);

        exit;
    }


    /*
     * =========================================================
     * UPDATE ITEM QUANTITY
     * =========================================================
     */

    if ($action === "update") {

        $item_id = $data["item_id"] ?? null;
        $quantity = $data["quantity"] ?? null;

        if (!$item_id) {
            throw new Exception(
                "Item ID is missing."
            );
        }

        if ($quantity === null || $quantity < 1) {
            throw new Exception(
                "Quantity must be at least 1."
            );
        }

        $stmt = $conn->prepare("
            UPDATE shopping_cart_items sci
            INNER JOIN shopping_cart sc
                ON sci.cart_id = sc.cart_id
            SET sci.quantity = ?
            WHERE sci.item_id = ?
            AND sc.client_id = ?
            AND sc.cart_status = 'active'
            AND sci.is_selected = 0
            AND sci.order_id IS NULL
        ");

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare quantity update: " .
                    $conn->error
            );
        }

        $stmt->bind_param(
            "iii",
            $quantity,
            $item_id,
            $client_id
        );

        if (!$stmt->execute()) {
            throw new Exception(
                "Failed to update quantity: " .
                    $stmt->error
            );
        }

        $stmt->close();

        echo json_encode([
            "success" => true,
            "message" => "Cart item updated successfully."
        ]);

        exit;
    }


    /*
     * =========================================================
     * REMOVE ITEM
     * =========================================================
     */

    if ($action === "remove") {

        $item_id = $data["item_id"] ?? null;

        if (!$item_id) {
            throw new Exception(
                "Item ID is missing."
            );
        }

        $stmt = $conn->prepare("
            DELETE sci
            FROM shopping_cart_items sci
            INNER JOIN shopping_cart sc
                ON sci.cart_id = sc.cart_id
            WHERE sci.item_id = ?
            AND sc.client_id = ?
            AND sc.cart_status = 'active'
            AND sci.order_id IS NULL
        ");

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare item removal: " .
                    $conn->error
            );
        }

        $stmt->bind_param(
            "ii",
            $item_id,
            $client_id
        );

        if (!$stmt->execute()) {
            throw new Exception(
                "Failed to remove cart item: " .
                    $stmt->error
            );
        }

        $deletedRows = $stmt->affected_rows;

        $stmt->close();

        echo json_encode([
            "success" => true,
            "deleted" => $deletedRows,
            "message" => $deletedRows > 0
                ? "Cart item removed successfully."
                : "Cart item was not found."
        ]);

        exit;
    }


    /*
     * =========================================================
     * ATTACH CART ITEMS TO AN ORDER
     * =========================================================
     *
     * Used for GCash after PayMongo successfully creates
     * the QR payment.
     *
     * IMPORTANT:
     *
     * is_selected remains 0.
     *
     * order_id is assigned so the item disappears from
     * the cart while payment is pending.
     */

    if ($action === "attach_order") {

        $order_id = isset($data["order_id"])
            ? (int) $data["order_id"]
            : 0;

        $item_ids = $data["item_ids"] ?? [];

        if ($order_id <= 0) {
            throw new Exception(
                "Invalid order ID."
            );
        }

        if (!is_array($item_ids)) {
            throw new Exception(
                "item_ids must be an array."
            );
        }

        $cleanIds = [];

        foreach ($item_ids as $item_id) {

            $numericId = (int) $item_id;

            if (
                $numericId > 0 &&
                !in_array(
                    $numericId,
                    $cleanIds,
                    true
                )
            ) {
                $cleanIds[] = $numericId;
            }
        }

        if (count($cleanIds) === 0) {
            throw new Exception(
                "No valid cart item IDs were received."
            );
        }

        $conn->begin_transaction();

        try {

            /*
             * Verify that the order belongs to the client.
             */

            $orderStmt = $conn->prepare("
                SELECT order_id
                FROM orders
                WHERE order_id = ?
                AND client_id = ?
                LIMIT 1
            ");

            if (!$orderStmt) {
                throw new Exception(
                    "Failed to prepare order verification: " .
                        $conn->error
                );
            }

            $orderStmt->bind_param(
                "ii",
                $order_id,
                $client_id
            );

            if (!$orderStmt->execute()) {
                throw new Exception(
                    "Failed to verify order: " .
                        $orderStmt->error
                );
            }

            $orderResult =
                $orderStmt->get_result();

            if ($orderResult->num_rows === 0) {
                $orderStmt->close();

                throw new Exception(
                    "Order does not belong to this client."
                );
            }

            $orderStmt->close();

            /*
             * Attach every underlying cart row.
             */

            $stmt = $conn->prepare("
                UPDATE shopping_cart_items sci
                INNER JOIN shopping_cart sc
                    ON sci.cart_id = sc.cart_id
                SET sci.order_id = ?
                WHERE sci.item_id = ?
                AND sc.client_id = ?
                AND sc.cart_status = 'active'
                AND sci.is_selected = 0
                AND sci.order_id IS NULL
            ");

            if (!$stmt) {
                throw new Exception(
                    "Failed to prepare order attachment: " .
                        $conn->error
                );
            }

            $updatedRows = 0;

            foreach ($cleanIds as $item_id) {

                $stmt->bind_param(
                    "iii",
                    $order_id,
                    $item_id,
                    $client_id
                );

                if (!$stmt->execute()) {
                    throw new Exception(
                        "Failed to attach cart item to order: " .
                            $stmt->error
                    );
                }

                $updatedRows +=
                    $stmt->affected_rows;
            }

            $stmt->close();

            $conn->commit();

            echo json_encode([
                "success" => true,
                "updated" => $updatedRows,
                "order_id" => $order_id,
                "message" =>
                    "Cart items attached to the pending order."
            ]);

            exit;

        } catch (Exception $error) {

            $conn->rollback();

            throw $error;
        }
    }


    /*
     * =========================================================
     * MARK PURCHASED ITEMS AS SELECTED
     * =========================================================
     *
     * Used after:
     *
     * - COD order is successfully created
     * - GCash payment becomes paid
     *
     * Both is_selected and order_id are saved.
     */

    if ($action === "mark_selected") {

        $item_ids = $data["item_ids"] ?? [];

        $order_id = isset($data["order_id"])
            ? (int) $data["order_id"]
            : 0;

        if (!is_array($item_ids)) {
            throw new Exception(
                "item_ids must be an array."
            );
        }

        $cleanIds = [];

        foreach ($item_ids as $item_id) {

            $numericId = (int) $item_id;

            if (
                $numericId > 0 &&
                !in_array(
                    $numericId,
                    $cleanIds,
                    true
                )
            ) {
                $cleanIds[] = $numericId;
            }
        }

        if (count($cleanIds) === 0) {
            throw new Exception(
                "No valid cart item IDs were received."
            );
        }

        if ($order_id <= 0) {
            throw new Exception(
                "A valid order ID is required."
            );
        }

        $conn->begin_transaction();

        try {

            /*
             * Verify order belongs to client.
             */

            $orderStmt = $conn->prepare("
                SELECT order_id
                FROM orders
                WHERE order_id = ?
                AND client_id = ?
                LIMIT 1
            ");

            if (!$orderStmt) {
                throw new Exception(
                    "Failed to prepare order verification: " .
                        $conn->error
                );
            }

            $orderStmt->bind_param(
                "ii",
                $order_id,
                $client_id
            );

            if (!$orderStmt->execute()) {
                throw new Exception(
                    "Failed to verify order: " .
                        $orderStmt->error
                );
            }

            $orderResult =
                $orderStmt->get_result();

            if ($orderResult->num_rows === 0) {
                $orderStmt->close();

                throw new Exception(
                    "Order does not belong to this client."
                );
            }

            $orderStmt->close();

            /*
             * Mark purchased rows.
             */

            $stmt = $conn->prepare("
                UPDATE shopping_cart_items sci
                INNER JOIN shopping_cart sc
                    ON sci.cart_id = sc.cart_id
                SET
                    sci.is_selected = 1,
                    sci.order_id = ?
                WHERE sci.item_id = ?
                AND sc.client_id = ?
                AND sc.cart_status = 'active'
            ");

            if (!$stmt) {
                throw new Exception(
                    "Failed to prepare cart selection update: " .
                        $conn->error
                );
            }

            $updatedRows = 0;

            foreach ($cleanIds as $item_id) {

                $stmt->bind_param(
                    "iii",
                    $order_id,
                    $item_id,
                    $client_id
                );

                if (!$stmt->execute()) {
                    throw new Exception(
                        "Failed to mark cart item as selected: " .
                            $stmt->error
                    );
                }

                $updatedRows +=
                    $stmt->affected_rows;
            }

            $stmt->close();

            /*
             * Abandon the active cart only if there are
             * no remaining NORMAL visible items.
             *
             * Pending GCash items have an order_id and
             * therefore do not count as normal cart items.
             */

            $checkStmt = $conn->prepare("
                SELECT sc.cart_id
                FROM shopping_cart sc
                WHERE sc.client_id = ?
                AND sc.cart_status = 'active'
                AND NOT EXISTS (
                    SELECT 1
                    FROM shopping_cart_items sci
                    WHERE sci.cart_id = sc.cart_id
                    AND sci.is_selected = 0
                    AND sci.order_id IS NULL
                )
                LIMIT 1
            ");

            if (!$checkStmt) {
                throw new Exception(
                    "Failed to prepare empty cart check: " .
                        $conn->error
                );
            }

            $checkStmt->bind_param(
                "i",
                $client_id
            );

            if (!$checkStmt->execute()) {
                throw new Exception(
                    "Failed to check remaining cart items: " .
                        $checkStmt->error
                );
            }

            $checkResult =
                $checkStmt->get_result();

            if ($checkResult->num_rows > 0) {

                $activeCart =
                    $checkResult->fetch_assoc();

                $activeCartId =
                    (int) $activeCart["cart_id"];

                $checkStmt->close();

                $abandonStmt = $conn->prepare("
                    UPDATE shopping_cart
                    SET cart_status = 'abandoned'
                    WHERE cart_id = ?
                    AND client_id = ?
                    AND cart_status = 'active'
                ");

                if (!$abandonStmt) {
                    throw new Exception(
                        "Failed to prepare cart status update: " .
                            $conn->error
                    );
                }

                $abandonStmt->bind_param(
                    "ii",
                    $activeCartId,
                    $client_id
                );

                if (!$abandonStmt->execute()) {
                    throw new Exception(
                        "Failed to update cart status: " .
                            $abandonStmt->error
                    );
                }

                $abandonStmt->close();

            } else {

                $checkStmt->close();
            }

            $conn->commit();

            echo json_encode([
                "success" => true,
                "updated" => $updatedRows,
                "order_id" => $order_id,
                "message" =>
                    "Purchased cart items marked as selected."
            ]);

            exit;

        } catch (Exception $error) {

            $conn->rollback();

            throw $error;
        }
    }


    /*
     * =========================================================
     * CLEAR CART
     * =========================================================
     *
     * Only normal visible cart rows are deleted.
     *
     * Pending GCash rows are preserved because they already
     * belong to an order.
     */

    if ($action === "clear") {

        $stmt = $conn->prepare("
            SELECT cart_id
            FROM shopping_cart
            WHERE client_id = ?
            AND cart_status = 'active'
            LIMIT 1
        ");

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare active cart lookup: " .
                    $conn->error
            );
        }

        $stmt->bind_param(
            "i",
            $client_id
        );

        if (!$stmt->execute()) {
            throw new Exception(
                "Failed to find active cart: " .
                    $stmt->error
            );
        }

        $result = $stmt->get_result();

        if ($result->num_rows === 0) {

            echo json_encode([
                "success" => true,
                "message" => "Cart is already empty."
            ]);

            exit;
        }

        $cart = $result->fetch_assoc();

        $cart_id = (int) $cart["cart_id"];

        $stmt->close();

        /*
         * Delete ONLY normal cart items.
         */

        $stmt = $conn->prepare("
            DELETE FROM shopping_cart_items
            WHERE cart_id = ?
            AND is_selected = 0
            AND order_id IS NULL
        ");

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare cart clearing: " .
                    $conn->error
            );
        }

        $stmt->bind_param(
            "i",
            $cart_id
        );

        if (!$stmt->execute()) {
            throw new Exception(
                "Failed to clear cart items: " .
                    $stmt->error
            );
        }

        $deletedRows = $stmt->affected_rows;

        $stmt->close();

        /*
         * Check whether normal visible items remain.
         */

        $checkStmt = $conn->prepare("
            SELECT item_id
            FROM shopping_cart_items
            WHERE cart_id = ?
            AND is_selected = 0
            AND order_id IS NULL
            LIMIT 1
        ");

        if (!$checkStmt) {
            throw new Exception(
                "Failed to check remaining cart items: " .
                    $conn->error
            );
        }

        $checkStmt->bind_param(
            "i",
            $cart_id
        );

        if (!$checkStmt->execute()) {
            throw new Exception(
                "Failed to check cart contents: " .
                    $checkStmt->error
            );
        }

        $remainingResult =
            $checkStmt->get_result();

        $checkStmt->close();

        /*
         * Only abandon the cart when there are no normal
         * visible items left.
         *
         * Pending GCash rows may still exist.
         */

        if ($remainingResult->num_rows === 0) {

            $stmt = $conn->prepare("
                UPDATE shopping_cart
                SET cart_status = 'abandoned'
                WHERE cart_id = ?
                AND client_id = ?
                AND cart_status = 'active'
            ");

            if (!$stmt) {
                throw new Exception(
                    "Failed to prepare cart status update: " .
                        $conn->error
                );
            }

            $stmt->bind_param(
                "ii",
                $cart_id,
                $client_id
            );

            if (!$stmt->execute()) {
                throw new Exception(
                    "Failed to update cart status: " .
                        $stmt->error
                );
            }

            $stmt->close();
        }

        echo json_encode([
            "success" => true,
            "deleted" => $deletedRows,
            "message" => "Cart cleared successfully."
        ]);

        exit;
    }


    /*
     * =========================================================
     * INVALID ACTION
     * =========================================================
     */

    throw new Exception(
        "Invalid cart action: " . $action
    );

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}