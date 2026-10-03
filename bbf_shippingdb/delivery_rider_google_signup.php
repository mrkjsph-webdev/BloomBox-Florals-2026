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

$firebase_uid = trim($data["firebase_uid"] ?? "");
$google_id = trim($data["google_id"] ?? "");
$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$pfp = trim($data["pfp"] ?? "");

if ($firebase_uid === "" || $google_id === "" || $name === "" || $email === "") {
    echo json_encode([
        "success" => false,
        "message" => "Required Google account information is missing."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email address."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Check if Google account already exists
|--------------------------------------------------------------------------
*/

$check = $conn->prepare("
    SELECT
        rider_id,
        google_id,
        firebase_uid,
        name,
        email,
        pfp,
        contact_number,
        created_at,
        last_login
    FROM delivery_rider
    WHERE email = ?
       OR google_id = ?
       OR firebase_uid = ?
    LIMIT 1
");

$check->bind_param(
    "sss",
    $email,
    $google_id,
    $firebase_uid
);

$check->execute();

$result = $check->get_result();

if ($result->num_rows > 0) {
    $rider = $result->fetch_assoc();

    $update = $conn->prepare("
        UPDATE delivery_rider
        SET
            google_id = ?,
            firebase_uid = ?,
            name = ?,
            pfp = ?,
            last_login = NOW()
        WHERE rider_id = ?
    ");

    $update->bind_param(
        "ssssi",
        $google_id,
        $firebase_uid,
        $name,
        $pfp,
        $rider["rider_id"]
    );

    $update->execute();
    $update->close();

    $rider["google_id"] = $google_id;
    $rider["firebase_uid"] = $firebase_uid;
    $rider["name"] = $name;
    $rider["pfp"] = $pfp;
    $rider["last_login"] = date("Y-m-d H:i:s");

    echo json_encode([
        "success" => true,
        "message" => "Delivery rider Google account signed in successfully.",
        "rider" => $rider
    ]);

    $check->close();
    $conn->close();
    exit;
}

$check->close();

/*
|--------------------------------------------------------------------------
| Create new delivery rider
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    INSERT INTO delivery_rider (
        google_id,
        firebase_uid,
        name,
        email,
        pfp,
        last_login
    )
    VALUES (?, ?, ?, ?, ?, NOW())
");

$stmt->bind_param(
    "sssss",
    $google_id,
    $firebase_uid,
    $name,
    $email,
    $pfp
);

if ($stmt->execute()) {
    $rider_id = $stmt->insert_id;

    $rider = [
        "rider_id" => $rider_id,
        "google_id" => $google_id,
        "firebase_uid" => $firebase_uid,
        "name" => $name,
        "email" => $email,
        "pfp" => $pfp,
        "contact_number" => null,
        "created_at" => date("Y-m-d H:i:s"),
        "last_login" => date("Y-m-d H:i:s")
    ];

    echo json_encode([
        "success" => true,
        "message" => "Delivery rider Google account created successfully.",
        "rider" => $rider
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Unable to create delivery rider Google account."
    ]);
}

$stmt->close();
$conn->close();
?>