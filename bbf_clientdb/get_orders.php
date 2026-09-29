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

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON request."
    ]);
    exit;
}

$client_id = isset($data["client_id"])
    ? (int) $data["client_id"]
    : 0;

if ($client_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid client ID."
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT
        order_id,
        client_id,
        order_date,
        order_status,
        unit_price
    FROM orders
    WHERE client_id = ?
    ORDER BY order_date DESC, order_id DESC
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare orders query."
    ]);
    exit;
}

$stmt->bind_param("i", $client_id);

if (!$stmt->execute()) {
    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve orders."
    ]);
    exit;
}

$result = $stmt->get_result();

$orders = [];

while ($row = $result->fetch_assoc()) {
    $orders[] = [
        "order_id" => (int) $row["order_id"],
        "client_id" => (int) $row["client_id"],
        "order_date" => $row["order_date"],
        "order_status" => $row["order_status"],
        "unit_price" => (float) $row["unit_price"]
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "orders" => $orders
]);

?>