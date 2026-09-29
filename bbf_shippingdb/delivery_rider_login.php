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
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
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
        google_id,
        firebase_uid,
        name,
        hash_password,
        email,
        pfp,
        contact_number,
        created_at,
        last_login
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
        "message" => "Invalid email or password."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$rider = $result->fetch_assoc();

if (
    empty($rider["hash_password"]) ||
    !password_verify($password, $rider["hash_password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$update = $conn->prepare("
    UPDATE delivery_rider
    SET last_login = NOW()
    WHERE rider_id = ?
");

$update->bind_param("i", $rider["rider_id"]);
$update->execute();
$update->close();

$rider["last_login"] = date("Y-m-d H:i:s");

unset($rider["hash_password"]);

echo json_encode([
    "success" => true,
    "message" => "Delivery rider login successful.",
    "rider" => $rider
]);

$stmt->close();
$conn->close();

?>