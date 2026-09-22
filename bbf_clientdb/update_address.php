<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$client_id = $data["client_id"] ?? "";
$address = trim($data["address"] ?? "");

if ($client_id === "" || $address === "") {
    echo json_encode([
        "success" => false,
        "message" => "Address is required."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "UPDATE Client
     SET address = ?
     WHERE client_id = ?"
);

$stmt->bind_param(
    "si",
    $address,
    $client_id
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Address updated successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update address."
    ]);
}

$stmt->close();
$conn->close();

?>