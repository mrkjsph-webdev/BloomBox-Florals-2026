<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

require_once "client_db.php";

$data = json_decode(file_get_contents("php://input"), true);

$firebase_uid = trim($data["firebase_uid"] ?? "");
$google_id = trim($data["google_id"] ?? "");
$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$pfp = trim($data["pfp"] ?? "");

if ($firebase_uid === "" || $email === "" || $name === "") {
    echo json_encode([
        "success" => false,
        "message" => "Google account information is incomplete."
    ]);
    exit;
}

/* Insert or update Google account */

$stmt = $conn->prepare(
    "INSERT INTO Client
    (firebase_uid, google_id, name, email, pfp, created_at, last_login)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
        firebase_uid = VALUES(firebase_uid),
        google_id = VALUES(google_id),
        name = VALUES(name),
        pfp = VALUES(pfp),
        last_login = NOW()"
);

$stmt->bind_param(
    "sssss",
    $firebase_uid,
    $google_id,
    $name,
    $email,
    $pfp
);

if ($stmt->execute()) {

    /* Get the actual client ID */

    $clientStmt = $conn->prepare(
        "SELECT client_id, firebase_uid, google_id, name, email, pfp
         FROM Client
         WHERE email = ?"
    );

    $clientStmt->bind_param("s", $email);
    $clientStmt->execute();

    $result = $clientStmt->get_result();
    $client = $result->fetch_assoc();

    $clientStmt->close();

    echo json_encode([
        "success" => true,
        "client" => [
            "client_id" => $client["client_id"],
            "firebase_uid" => $client["firebase_uid"],
            "google_id" => $client["google_id"],
            "name" => $client["name"],
            "email" => $client["email"],
            "pfp" => $client["pfp"]
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to save Google account."
    ]);
}

$stmt->close();
$conn->close();

?>