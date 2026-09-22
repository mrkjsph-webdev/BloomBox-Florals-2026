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
$contact_number = trim($data["contact_number"] ?? "");
$gender = $data["gender"] ?? "";

if ($client_id === "" || $contact_number === "" || $gender === "") {
    echo json_encode([
        "success" => false,
        "message" => "Phone number and gender are required."
    ]);
    exit;
}

$allowedGenders = [
    "Female",
    "Male",
    "Prefer not to say"
];

if (!in_array($gender, $allowedGenders, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid gender."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "UPDATE Client
     SET contact_number = ?, gender = ?
     WHERE client_id = ?"
);

$stmt->bind_param(
    "ssi",
    $contact_number,
    $gender,
    $client_id
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to update profile."
    ]);
}

$stmt->close();
$conn->close();

?>