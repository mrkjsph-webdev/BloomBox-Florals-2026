<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "shipping_db.php";

try {
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
        ORDER BY rider_id DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Failed to retrieve delivery riders.");
    }

    $riders = [];

    while ($rider = $result->fetch_assoc()) {
        $riders[] = [
            "rider_id" => (int) $rider["rider_id"],
            "name" => $rider["name"],
            "email" => $rider["email"],
            "phone" => $rider["contact_number"],
            "contact_number" => $rider["contact_number"],
            "pfp" => $rider["pfp"],
            "joined" => $rider["created_at"],
            "created_at" => $rider["created_at"],
            "last_login" => $rider["last_login"],

            /*
             * These fields are included because the
             * AdminDashboard Delivery Rider section
             * already expects them.
             *
             * Your current delivery_rider table does
             * not contain status or deliveries yet.
             */
            "status" => "—",
            "deliveries" => 0,
        ];
    }

    echo json_encode([
        "success" => true,
        "riders" => $riders
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