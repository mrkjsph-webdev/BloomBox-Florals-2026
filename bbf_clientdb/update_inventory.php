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

$flower_id = isset($data["flower_id"])
    ? (int) $data["flower_id"]
    : 0;

$amount = isset($data["amount"])
    ? (int) $data["amount"]
    : 0;

if ($flower_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid flower ID."
    ]);
    exit;
}

if ($amount === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Stock adjustment cannot be zero."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| GET CURRENT STOCK
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT
        flower_id,
        flower_name,
        stock
    FROM bbf_inventorydb.flower_inventory
    WHERE flower_id = ?
    LIMIT 1
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare inventory query.",
        "database_error" => $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "i",
    $flower_id
);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve inventory.",
        "database_error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" => "Flower not found."
    ]);

    exit;
}

$flower = $result->fetch_assoc();

$stmt->close();

/*
|--------------------------------------------------------------------------
| CALCULATE NEW STOCK
|--------------------------------------------------------------------------
*/

$currentStock = (int) $flower["stock"];

$newStock = $currentStock + $amount;

/*
|--------------------------------------------------------------------------
| PREVENT NEGATIVE STOCK
|--------------------------------------------------------------------------
*/

if ($newStock < 0) {
    $stmt = null;

    $conn->close();

    echo json_encode([
        "success" => false,
        "message" => "Stock cannot be decreased below 0.",
        "flower_id" => $flower_id,
        "flower_name" => $flower["flower_name"],
        "current_stock" => $currentStock
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| UPDATE STOCK
|--------------------------------------------------------------------------
*/

$updateStmt = $conn->prepare("
    UPDATE bbf_inventorydb.flower_inventory
    SET stock = ?
    WHERE flower_id = ?
");

if (!$updateStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare inventory update.",
        "database_error" => $conn->error
    ]);

    $conn->close();

    exit;
}

$updateStmt->bind_param(
    "ii",
    $newStock,
    $flower_id
);

if (!$updateStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update stock.",
        "database_error" => $updateStmt->error
    ]);

    $updateStmt->close();
    $conn->close();

    exit;
}

$updateStmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "message" => "Inventory updated successfully.",
    "flower_id" => $flower_id,
    "flower_name" => $flower["flower_name"],
    "previous_stock" => $currentStock,
    "amount_changed" => $amount,
    "stock" => $newStock
]);
