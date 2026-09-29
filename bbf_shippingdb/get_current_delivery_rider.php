<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

require_once "shipping_db.php";

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!is_array($input)) {
        throw new Exception("Invalid request data.");
    }

    $rider_id = isset($input["rider_id"])
        ? (int) $input["rider_id"]
        : 0;

    if ($rider_id <= 0) {
        throw new Exception("Delivery rider ID is required.");
    }

    $sql = "
        SELECT
            rider_id,
            name,
            email,
            pfp,
            contact_number,
            created_at,
            last_login
        FROM delivery_rider
        WHERE rider_id = ?
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Failed to prepare delivery rider query.");
    }

    $stmt->bind_param("i", $rider_id);

    if (!$stmt->execute()) {
        throw new Exception("Failed to retrieve delivery rider.");
    }

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Delivery rider not found.");
    }

    $rider = $result->fetch_assoc();

    $stmt->close();

    echo json_encode([
        "success" => true,
        "rider" => [
            "rider_id" => (int) $rider["rider_id"],
            "name" => $rider["name"],
            "email" => $rider["email"],
            "phone" => $rider["contact_number"],
            "contact_number" => $rider["contact_number"],
            "pfp" => $rider["pfp"],
            "joined" => $rider["created_at"],
            "created_at" => $rider["created_at"],
            "last_login" => $rider["last_login"]
        ]
    ]);

} catch (Exception $error) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $error->getMessage()
    ]);
}

$conn->close();
?>