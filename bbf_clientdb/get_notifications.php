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

if (!is_array($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON request."
    ]);
    exit;
}

$client_id = isset($data["client_id"])
    ? (int) $data["client_id"]
    : 0;

if ($client_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid client ID."
    ]);
    exit;
}

try {

    $query = "
        SELECT
            notification_id,
            client_id,
            order_id,
            title,
            message,
            notification_type,
            created_at
        FROM notifications
        WHERE client_id = ?
        ORDER BY notification_id DESC
    ";

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception(
            "Failed to prepare notification query: " .
                $conn->error
        );
    }

    $stmt->bind_param(
        "i",
        $client_id
    );

    if (!$stmt->execute()) {
        throw new Exception(
            "Failed to retrieve notifications: " .
                $stmt->error
        );
    }

    $result = $stmt->get_result();

    $notifications = [];

    while ($notification = $result->fetch_assoc()) {

        $createdAt = $notification["created_at"];

        $notifications[] = [
            "id" => (int) $notification["notification_id"],
            "notification_id" =>
                (int) $notification["notification_id"],

            "client_id" =>
                (int) $notification["client_id"],

            "order_id" =>
                (int) $notification["order_id"],

            "title" =>
                $notification["title"],

            "message" =>
                $notification["message"],

            "type" =>
                $notification["notification_type"],

            "date" =>
                date("M d, Y h:i A", strtotime($createdAt)),

            "created_at" =>
                $createdAt
        ];
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "notifications" => $notifications
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