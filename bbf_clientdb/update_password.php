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
$current_password = $data["current_password"] ?? "";
$new_password = $data["new_password"] ?? "";

if ($client_id === "" || $current_password === "" || $new_password === "") {
    echo json_encode([
        "success" => false,
        "message" => "All password fields are required."
    ]);
    exit;
}

if (strlen($new_password) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "New password must be at least 8 characters."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT hash_password
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
    $stmt->close();
    $conn->close();
    exit;
}

$client = $result->fetch_assoc();

if (empty($client["hash_password"])) {
    echo json_encode([
        "success" => false,
        "message" => "This account does not have a password."
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

if (!password_verify($current_password, $client["hash_password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Current password is incorrect."
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$new_hash = password_hash($new_password, PASSWORD_DEFAULT);

$updateStmt = $conn->prepare(
    "UPDATE Client
     SET hash_password = ?
     WHERE client_id = ?"
);

$updateStmt->bind_param("si", $new_hash, $client_id);

if ($updateStmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Password updated successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Unable to update password."
    ]);
}

$updateStmt->close();
$stmt->close();
$conn->close();

?>