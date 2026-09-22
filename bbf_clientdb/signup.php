<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

require_once "client_db.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($name === "" || $email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required."
    ]);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 8 characters."
    ]);
    exit;
}

/* Check if email already exists */

$check = $conn->prepare(
    "SELECT client_id FROM Client WHERE email = ?"
);

$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Email is already registered."
    ]);

    $check->close();
    $conn->close();
    exit;
}

$check->close();

/* Hash password */

$hashedPassword = password_hash(
    $password,
    PASSWORD_DEFAULT
);

/* Insert client */

$stmt = $conn->prepare(
    "INSERT INTO Client
    (name, email, hash_password, created_at)
    VALUES (?, ?, ?, NOW())"
);

$stmt->bind_param(
    "sss",
    $name,
    $email,
    $hashedPassword
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to create account."
    ]);
}

$stmt->close();
$conn->close();

?>