<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "client_db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);

    exit;
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email = isset($data["email"])
    ? trim($data["email"])
    : "";

if ($email === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please enter your email address."
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


/*
|--------------------------------------------------------------------------
| FIND ACCOUNT
|--------------------------------------------------------------------------
|
| A regular BloomBox account must have a password stored
| in hash_password.
|
| Google accounts do not use this password reset system.
|
*/

$stmt = $conn->prepare("
    SELECT
        client_id,
        name,
        email,
        hash_password,
        firebase_uid,
        google_id
    FROM Client
    WHERE email = ?
    LIMIT 1
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare account lookup.",
        "database_error" => $conn->error
    ]);

    $conn->close();

    exit;
}

$stmt->bind_param("s", $email);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to check the account.",
        "database_error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" => "No account was found with that email address."
    ]);

    exit;
}

$client = $result->fetch_assoc();

$stmt->close();


/*
|--------------------------------------------------------------------------
| CHECK IF THIS IS A REGULAR ACCOUNT
|--------------------------------------------------------------------------
*/

$hashPassword = trim(
    (string) ($client["hash_password"] ?? "")
);

$googleId = trim(
    (string) ($client["google_id"] ?? "")
);

$firebaseUid = trim(
    (string) ($client["firebase_uid"] ?? "")
);


/*
|--------------------------------------------------------------------------
| GOOGLE ACCOUNT CHECK
|--------------------------------------------------------------------------
|
| If the account is a Google/Firebase account and does not
| have a regular password, do not reset it here.
|
*/

if (
    $hashPassword === "" &&
    (
        $googleId !== "" ||
        $firebaseUid !== ""
    )
) {
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" =>
            "This account uses Google Login. Please use \"Continue with Google\" to sign in."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CHECK PASSWORD ACCOUNT
|--------------------------------------------------------------------------
*/

if ($hashPassword === "") {
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" =>
            "This account does not use regular email and password login."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GENERATE TEMPORARY PASSWORD
|--------------------------------------------------------------------------
|
| This is intended for the current local/demo XAMPP system.
|
*/

$characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" .
    "abcdefghijkmnopqrstuvwxyz" .
    "23456789";

$temporaryPassword = "";

$characterCount = strlen($characters);

for ($i = 0; $i < 10; $i++) {
    $temporaryPassword .=
        $characters[random_int(0, $characterCount - 1)];
}


/*
|--------------------------------------------------------------------------
| HASH TEMPORARY PASSWORD
|--------------------------------------------------------------------------
*/

$newPasswordHash = password_hash(
    $temporaryPassword,
    PASSWORD_DEFAULT
);

if ($newPasswordHash === false) {
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to generate a new password."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| UPDATE PASSWORD
|--------------------------------------------------------------------------
*/

$updateStmt = $conn->prepare("
    UPDATE Client
    SET hash_password = ?
    WHERE client_id = ?
    LIMIT 1
");

if (!$updateStmt) {
    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to prepare the password update.",
        "database_error" => $conn->error
    ]);

    $conn->close();

    exit;
}

$clientId = (int) $client["client_id"];

$updateStmt->bind_param(
    "si",
    $newPasswordHash,
    $clientId
);

if (!$updateStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to update the password.",
        "database_error" => $updateStmt->error
    ]);

    $updateStmt->close();
    $conn->close();

    exit;
}

$updateStmt->close();
$conn->close();


/*
|--------------------------------------------------------------------------
| SUCCESS
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" =>
        "A temporary password has been generated. Use it to log in.",
    "temporary_password" => $temporaryPassword
]);

?>