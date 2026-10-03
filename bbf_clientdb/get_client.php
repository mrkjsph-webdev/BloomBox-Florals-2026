<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "client_db.php";

$data = json_decode(file_get_contents("php://input"), true);

$client_id = $data["client_id"] ?? "";

if ($client_id === "") {
    echo json_encode([
        "success" => false,
        "message" => "Client ID is required."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT client_id, name, email, contact_number, gender, address, pfp
     FROM Client
     WHERE client_id = ?"
);

$stmt->bind_param("i", $client_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Client not found."
    ]);
    exit;
}

$client = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "client" => $client
]);

$stmt->close();
$conn->close();

?>