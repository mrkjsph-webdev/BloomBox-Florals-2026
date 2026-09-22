<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

require_once "db.php";

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

/* Find account */

$stmt = $conn->prepare(
    "SELECT client_id, name, email, hash_password, pfp
     FROM Client
     WHERE email = ?"
);

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

$client = $result->fetch_assoc();

/* Check password */

if (
    empty($client["hash_password"]) ||
    !password_verify($password, $client["hash_password"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

/* Update last login */

$update = $conn->prepare(
    "UPDATE Client
     SET last_login = NOW()
     WHERE client_id = ?"
);

$update->bind_param("i", $client["client_id"]);
$update->execute();

$update->close();
$stmt->close();
$conn->close();

/* Successful login */

echo json_encode([
    "success" => true,
    "client" => [
        "client_id" => $client["client_id"],
        "name" => $client["name"],
        "email" => $client["email"],
        "pfp" => $client["pfp"]
    ]
]);

?>