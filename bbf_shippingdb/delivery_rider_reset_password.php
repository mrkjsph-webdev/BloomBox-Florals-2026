<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "shipping_db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");

if ($email === "") {
    echo json_encode([
        "success" => false,
        "message" => "Email is required."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT
        rider_id,
        email,
        hash_password
    FROM delivery_rider
    WHERE email = ?
    LIMIT 1
");

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "No delivery rider account was found with this email."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$rider = $result->fetch_assoc();

/*
 * Google-only accounts do not have a password.
 * Allowing this endpoint to create a password gives the rider
 * the option to use email/password login afterward.
 */

$temporaryPassword = substr(
    str_shuffle("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"),
    0,
    8
);

$hashedPassword = password_hash(
    $temporaryPassword,
    PASSWORD_DEFAULT
);

$update = $conn->prepare("
    UPDATE delivery_rider
    SET hash_password = ?
    WHERE rider_id = ?
");

$update->bind_param(
    "si",
    $hashedPassword,
    $rider["rider_id"]
);

if (!$update->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to reset the delivery rider password."
    ]);

    $update->close();
    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "A temporary password has been generated.",
    "temporary_password" => $temporaryPassword
]);

$update->close();
$stmt->close();
$conn->close();

?>