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
     */

    if ($action === "get") {

        /*
         * Find the customer's active cart.
         */

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

        /*
         * Customer does not have an active cart.
         */

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


        /*
         * =====================================================
         * GET CART ITEMS
         * =====================================================
         */

        $stmt = $conn->prepare("
            SELECT
                item_id,
                cart_id,
                flower_id,
                quantity,
                added_at,
                unit_price,
                customization
            FROM shopping_cart_items
            WHERE cart_id = ?
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

            /*
             * Decode customization JSON.
             */

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


            /*
             * Get the flower name from the customization.
             *
             * The actual flower_id belongs to
             * bbf_inventorydb.flower_inventory.
             */

            $flower_name = "Flower";

            if (
                isset($customization["flowers"]) &&
                is_array($customization["flowers"]) &&
                isset($customization["flowers"][0]["name"])
            ) {
                $flower_name =
                    $customization["flowers"][0]["name"];
            }


            /*
             * Return the item.
             */

            $items[] = [
                "id" => (int) $row["item_id"],
                "item_id" => (int) $row["item_id"],
                "cart_id" => (int) $row["cart_id"],
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
                    $row["added_at"]
            ];
        }


        /*
         * Return all cart items.
         */

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


        /*
         * Make sure the item belongs to the customer's
         * active cart.
         */

        $stmt = $conn->prepare("
            UPDATE shopping_cart_items sci
            INNER JOIN shopping_cart sc
                ON sci.cart_id = sc.cart_id
            SET sci.quantity = ?
            WHERE sci.item_id = ?
            AND sc.client_id = ?
            AND sc.cart_status = 'active'
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


        /*
         * Only delete the item if it belongs to the
         * customer's active cart.
         */

        $stmt = $conn->prepare("
            DELETE sci
            FROM shopping_cart_items sci
            INNER JOIN shopping_cart sc
                ON sci.cart_id = sc.cart_id
            WHERE sci.item_id = ?
            AND sc.client_id = ?
            AND sc.cart_status = 'active'
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

        echo json_encode([
            "success" => true,
            "message" => "Cart item removed successfully."
        ]);

        exit;
    }


    /*
     * =========================================================
     * CLEAR CART
     * =========================================================
     */

    if ($action === "clear") {

        /*
         * Find active cart.
         */

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


        /*
         * Delete cart items.
         */

        $stmt = $conn->prepare("
            DELETE FROM shopping_cart_items
            WHERE cart_id = ?
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


        /*
         * Mark cart as abandoned.
         */

        $stmt = $conn->prepare("
            UPDATE shopping_cart
            SET cart_status = 'abandoned'
            WHERE cart_id = ?
            AND client_id = ?
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

        echo json_encode([
            "success" => true,
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

?>