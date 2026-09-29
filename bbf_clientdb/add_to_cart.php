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

$client_id = $data["client_id"] ?? null;
$customization_json = $data["customization"] ?? null;

if (!$client_id) {
    echo json_encode([
        "success" => false,
        "message" => "Client ID is missing."
    ]);
    exit;
}

if (!$customization_json) {
    echo json_encode([
        "success" => false,
        "message" => "Customization data is missing."
    ]);
    exit;
}

/*
 * Decode customization sent by React.
 */
$customization = json_decode($customization_json, true);

if (!$customization) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid customization data."
    ]);
    exit;
}

$flowers = $customization["flowers"] ?? [];

if (!is_array($flowers) || count($flowers) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "No flowers were selected."
    ]);
    exit;
}

try {

    /*
     * ---------------------------------------------------------
     * CONNECT TO INVENTORY DATABASE
     * ---------------------------------------------------------
     */

    $inventory_conn = new mysqli(
        "localhost",
        "root",
        "",
        "bbf_inventorydb"
    );

    if ($inventory_conn->connect_error) {
        throw new Exception(
            "Inventory database connection failed: " .
            $inventory_conn->connect_error
        );
    }

    $inventory_conn->set_charset("utf8mb4");


    /*
     * ---------------------------------------------------------
     * FIND ACTIVE SHOPPING CART
     * ---------------------------------------------------------
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
            "Failed to prepare cart lookup: " . $conn->error
        );
    }

    $stmt->bind_param("i", $client_id);

    if (!$stmt->execute()) {
        throw new Exception(
            "Failed to find shopping cart: " . $stmt->error
        );
    }

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {

        $cart = $result->fetch_assoc();

        $cart_id = (int) $cart["cart_id"];

    } else {

        /*
         * -----------------------------------------------------
         * CREATE NEW ACTIVE CART
         * -----------------------------------------------------
         */

        $stmt = $conn->prepare("
            INSERT INTO shopping_cart
            (
                client_id,
                cart_status
            )
            VALUES (?, 'active')
        ");

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare cart creation: " . $conn->error
            );
        }

        $stmt->bind_param("i", $client_id);

        if (!$stmt->execute()) {
            throw new Exception(
                "Failed to create shopping cart: " . $stmt->error
            );
        }

        $cart_id = $conn->insert_id;
    }


    /*
     * ---------------------------------------------------------
     * CREATE UNIQUE BOUQUET ID
     * ---------------------------------------------------------
     *
     * Every flower belonging to this customized bouquet will
     * have the same bouquet_id.
     */

    $bouquet_id = uniqid("bouquet_", true);

    $customization["bouquet_id"] = $bouquet_id;


    /*
     * ---------------------------------------------------------
     * PREPARE FLOWER LOOKUP
     * ---------------------------------------------------------
     *
     * This verifies that every selected flower actually exists
     * in bbf_inventorydb.flower_inventory.
     */

    $flower_stmt = $inventory_conn->prepare("
        SELECT
            flower_id,
            flower_name
        FROM flower_inventory
        WHERE flower_id = ?
        LIMIT 1
    ");

    if (!$flower_stmt) {
        throw new Exception(
            "Failed to prepare flower lookup: " .
            $inventory_conn->error
        );
    }


    /*
     * ---------------------------------------------------------
     * PREPARE CART ITEM INSERT
     * ---------------------------------------------------------
     */

    $item_stmt = $conn->prepare("
        INSERT INTO shopping_cart_items
        (
            cart_id,
            flower_id,
            quantity,
            unit_price,
            customization
        )
        VALUES (?, ?, ?, ?, ?)
    ");

    if (!$item_stmt) {
        throw new Exception(
            "Failed to prepare cart item insertion: " .
            $conn->error
        );
    }


    /*
     * ---------------------------------------------------------
     * INSERT EACH SELECTED FLOWER
     * ---------------------------------------------------------
     */

    $inserted_items = [];

    foreach ($flowers as $flower) {

        $flower_id = isset($flower["id"])
            ? (int) $flower["id"]
            : 0;

        $quantity = isset($flower["quantity"])
            ? (int) $flower["quantity"]
            : 1;

        $unit_price = isset($flower["unit_price"])
            ? (float) $flower["unit_price"]
            : 0;

        if ($flower_id <= 0) {
            throw new Exception(
                "A selected flower has an invalid flower ID."
            );
        }

        if ($quantity <= 0) {
            throw new Exception(
                "A selected flower has an invalid quantity."
            );
        }


        /*
         * Verify flower exists in inventory.
         */

        $flower_stmt->bind_param("i", $flower_id);

        if (!$flower_stmt->execute()) {
            throw new Exception(
                "Failed to verify flower ID " .
                $flower_id . ": " .
                $flower_stmt->error
            );
        }

        $flower_result = $flower_stmt->get_result();

        if ($flower_result->num_rows === 0) {
            throw new Exception(
                "Flower ID " .
                $flower_id .
                " does not exist in flower_inventory."
            );
        }

        $inventory_flower = $flower_result->fetch_assoc();


        /*
         * Make sure the stored flower name matches the
         * inventory record.
         */

        $flower["id"] = $flower_id;
        $flower["name"] = $inventory_flower["flower_name"];
        $flower["quantity"] = $quantity;
        $flower["unit_price"] = $unit_price;


        /*
         * Insert the flower.
         */

        $item_customization = $customization;

        /*
         * Keep only the overall bouquet configuration in the
         * customization field. The selected flower for this
         * particular row is represented by flower_id.
         */
        $item_customization["flowers"] = [
            [
                "id" => $flower_id,
                "name" => $inventory_flower["flower_name"],
                "quantity" => $quantity,
                "unit_price" => $unit_price
            ]
        ];

        $item_customization_json = json_encode(
            $item_customization,
            JSON_UNESCAPED_UNICODE
        );

        $item_stmt->bind_param(
            "iiids",
            $cart_id,
            $flower_id,
            $quantity,
            $unit_price,
            $item_customization_json
        );

        if (!$item_stmt->execute()) {
            throw new Exception(
                "Failed to insert flower " .
                $inventory_flower["flower_name"] .
                ": " .
                $item_stmt->error
            );
        }

        $inserted_items[] = [
            "item_id" => $conn->insert_id,
            "flower_id" => $flower_id,
            "flower_name" => $inventory_flower["flower_name"],
            "quantity" => $quantity,
            "unit_price" => $unit_price
        ];
    }


    /*
     * Close connections/statements.
     */

    $item_stmt->close();
    $flower_stmt->close();
    $inventory_conn->close();


    /*
     * ---------------------------------------------------------
     * SUCCESS
     * ---------------------------------------------------------
     */

    echo json_encode([
        "success" => true,
        "message" => "Bouquet added to cart successfully.",
        "cart_id" => $cart_id,
        "bouquet_id" => $bouquet_id,
        "items" => $inserted_items
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

?>