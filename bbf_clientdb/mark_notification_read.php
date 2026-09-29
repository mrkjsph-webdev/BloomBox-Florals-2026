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

$notification_id = isset($data["notification_id"])
    ? (int) $data["notification_id"]
    : 0;

$mark_all = !empty($data["mark_all"]);

if ($client_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid client ID."
    ]);
    exit;
}

try {

    if ($mark_all) {

        $query = "
            UPDATE notifications
            SET notification_type = 'seen'
            WHERE client_id = ?
              AND notification_type = 'unread'
        ";

        $stmt = $conn->prepare($query);

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare notification update: " .
                    $conn->error
            );
        }

        $stmt->bind_param(
            "i",
            $client_id
        );

    } else {

        if ($notification_id <= 0) {
            throw new Exception(
                "Invalid notification ID."
            );
        }

        $query = "
            UPDATE notifications
            SET notification_type = 'seen'
            WHERE notification_id = ?
              AND client_id = ?
        ";

        $stmt = $conn->prepare($query);

        if (!$stmt) {
            throw new Exception(
                "Failed to prepare notification update: " .
                    $conn->error
            );
        }

        $stmt->bind_param(
            "ii",
            $notification_id,
            $client_id
        );
    }

    if (!$stmt->execute()) {
        throw new Exception(
            "Failed to mark notification as read: " .
                $stmt->error
        );
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Notification updated successfully."
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