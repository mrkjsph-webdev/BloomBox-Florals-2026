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

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
    ]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Check if email already exists
|--------------------------------------------------------------------------
*/

$check = $conn->prepare("
    SELECT rider_id
    FROM delivery_rider
    WHERE email = ?
    LIMIT 1
");

$check->bind_param("s", $email);
$check->execute();

$result = $check->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "An account with this email already exists."
    ]);

    $check->close();
    $conn->close();
    exit;
}

$check->close();

/*
|--------------------------------------------------------------------------
| Hash password
|--------------------------------------------------------------------------
*/

$hashPassword = password_hash($password, PASSWORD_DEFAULT);

/*
|--------------------------------------------------------------------------
| Insert delivery rider
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    INSERT INTO delivery_rider (
        name,
        hash_password,
        email
    )
    VALUES (?, ?, ?)
");

$stmt->bind_param(
    "sss",
    $name,
    $hashPassword,
    $email
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Delivery rider account created successfully.",
        "rider_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Unable to create delivery rider account."
    ]);
}

$stmt->close();
$conn->close();
?>