<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "client_db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON request."
    ]);
    exit;
}

$client_id = isset($data["client_id"])
    ? (int) $data["client_id"]
    : 0;

$order_id = isset($data["order_id"])
    ? (int) $data["order_id"]
    : 0;

if ($client_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid client ID."
    ]);
    exit;
}

if ($order_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid order ID."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Get order, client, payment method, and PayMongo information
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT
        o.order_id,
        o.client_id,
        o.payment_id,
        o.order_date,
        o.order_status,
        o.delivery_method,
        o.unit_price,
        o.payment_status,

        o.paymongo_payment_intent_id,
        o.paymongo_payment_id,
        o.paymongo_qr_code_url,
        o.paymongo_qr_expires_at,

        c.name,
        c.email,
        c.contact_number,
        c.address,

        pm.payment_type,
        pm.gcash_last_four,
        pm.is_default

    FROM orders o

    INNER JOIN Client c
        ON o.client_id = c.client_id

    LEFT JOIN payment_methods pm
        ON o.payment_id = pm.payment_id
       AND pm.client_id = o.client_id

    WHERE o.order_id = ?
      AND o.client_id = ?

    LIMIT 1
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare order query.",
        "database_error" => $conn->error
    ]);

    exit;
}

$stmt->bind_param(
    "ii",
    $order_id,
    $client_id
);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve order.",
        "database_error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Order not found."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$order = $result->fetch_assoc();

$stmt->close();


/*
|--------------------------------------------------------------------------
| Get order items
|--------------------------------------------------------------------------
*/

$items = [];

$itemStmt = $conn->prepare("
    SELECT
        item_id,
        order_id,
        item_name,
        item_image,
        quantity,
        unit_price,
        customization,
        created_at
    FROM order_items
    WHERE order_id = ?
    ORDER BY item_id ASC
");

if (!$itemStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare order items query.",
        "database_error" => $conn->error
    ]);

    $conn->close();

    exit;
}

$itemStmt->bind_param(
    "i",
    $order_id
);

if (!$itemStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve order items.",
        "database_error" => $itemStmt->error
    ]);

    $itemStmt->close();
    $conn->close();

    exit;
}

$itemResult = $itemStmt->get_result();

while ($item = $itemResult->fetch_assoc()) {

    $customization = null;

    if (
        isset($item["customization"]) &&
        $item["customization"] !== ""
    ) {

        $decodedCustomization = json_decode(
            $item["customization"],
            true
        );

        if (json_last_error() === JSON_ERROR_NONE) {
            $customization = $decodedCustomization;
        } else {
            $customization = $item["customization"];
        }
    }

    $items[] = [
        "item_id" =>
        (int) $item["item_id"],

        "order_id" =>
        (int) $item["order_id"],

        "item_name" =>
        $item["item_name"],

        "item_image" =>
        $item["item_image"],

        "quantity" =>
        (int) $item["quantity"],

        "unit_price" =>
        (float) $item["unit_price"],

        "customization" =>
        $customization,

        "created_at" =>
        $item["created_at"]
    ];
}

$itemStmt->close();

$conn->close();


/*
|--------------------------------------------------------------------------
| Format payment method
|--------------------------------------------------------------------------
*/

$payment_method = null;

if (!empty($order["payment_id"])) {

    $payment_method = [
        "payment_id" =>
        (int) $order["payment_id"],

        "payment_type" =>
        $order["payment_type"],

        "gcash_last_four" =>
        $order["gcash_last_four"],

        "is_default" =>
        (int) $order["is_default"],

        "paymongo_payment_intent_id" =>
        $order["paymongo_payment_intent_id"],

        "paymongo_payment_id" =>
        $order["paymongo_payment_id"],

        "qr_code_url" =>
        $order["paymongo_qr_code_url"],

        "qr_expires_at" =>
        $order["paymongo_qr_expires_at"]
    ];
}


/*
|--------------------------------------------------------------------------
| Return complete order details
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,

    "order" => [
        "order_id" =>
        (int) $order["order_id"],

        "client_id" =>
        (int) $order["client_id"],

        "payment_id" =>
        $order["payment_id"]
            ? (int) $order["payment_id"]
            : null,

        "order_date" =>
        $order["order_date"],

        "order_status" =>
        $order["order_status"],

        "payment_status" =>
        $order["payment_status"],

        "delivery_method" =>
        $order["delivery_method"],

        "unit_price" =>
        (float) $order["unit_price"],

        "client_name" =>
        $order["name"],

        "email" =>
        $order["email"],

        "contact_number" =>
        $order["contact_number"],

        "address" =>
        $order["address"],

        "payment_method" =>
        $payment_method,

        "paymongo_payment_intent_id" =>
        $order["paymongo_payment_intent_id"],

        "paymongo_payment_id" =>
        $order["paymongo_payment_id"],

        "paymongo_qr_code_url" =>
        $order["paymongo_qr_code_url"],

        "paymongo_qr_expires_at" =>
        $order["paymongo_qr_expires_at"],

        "items" =>
        $items
    ]
]);
