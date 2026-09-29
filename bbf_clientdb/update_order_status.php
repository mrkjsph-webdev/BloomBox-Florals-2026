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

$order_id = isset($data["order_id"])
    ? (int) $data["order_id"]
    : 0;

$order_status = isset($data["order_status"])
    ? trim((string) $data["order_status"])
    : "";

if ($order_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid order ID."
    ]);
    exit;
}

$allowedStatuses = [
    "pending",
    "out for delivery",
    "completed",
    "cancelled"
];

if (!in_array($order_status, $allowedStatuses, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid order status."
    ]);
    exit;
}

try {

    /*
    |--------------------------------------------------------------------------
    | Get the current order
    |--------------------------------------------------------------------------
    */

    $orderQuery = "
        SELECT
            order_id,
            client_id,
            order_status
        FROM orders
        WHERE order_id = ?
        LIMIT 1
    ";

    $orderStmt = $conn->prepare($orderQuery);

    if (!$orderStmt) {
        throw new Exception(
            "Failed to prepare order query: " . $conn->error
        );
    }

    $orderStmt->bind_param(
        "i",
        $order_id
    );

    if (!$orderStmt->execute()) {
        throw new Exception(
            "Failed to retrieve order: " . $orderStmt->error
        );
    }

    $orderResult = $orderStmt->get_result();

    if ($orderResult->num_rows === 0) {
        $orderStmt->close();

        throw new Exception("Order not found.");
    }

    $order = $orderResult->fetch_assoc();

    $orderStmt->close();

    $client_id = (int) $order["client_id"];
    $previousStatus = (string) $order["order_status"];


    /*
    |--------------------------------------------------------------------------
    | Do nothing if the status did not actually change
    |--------------------------------------------------------------------------
    */

    if ($previousStatus === $order_status) {
        echo json_encode([
            "success" => true,
            "message" => "Order status is already set to this value.",
            "order_id" => $order_id,
            "client_id" => $client_id,
            "order_status" => $order_status,
            "notification_created" => false
        ]);

        $conn->close();
        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Update order status
    |--------------------------------------------------------------------------
    */

    $updateQuery = "
        UPDATE orders
        SET order_status = ?
        WHERE order_id = ?
    ";

    $updateStmt = $conn->prepare($updateQuery);

    if (!$updateStmt) {
        throw new Exception(
            "Failed to prepare order update: " . $conn->error
        );
    }

    $updateStmt->bind_param(
        "si",
        $order_status,
        $order_id
    );

    if (!$updateStmt->execute()) {
        throw new Exception(
            "Failed to update order status: " .
                $updateStmt->error
        );
    }

    $updateStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Create notification text
    |--------------------------------------------------------------------------
    */

    $title = "Order Status Updated";
    $message = "";

    switch ($order_status) {

        case "pending":
            $title = "Order Status Updated";

            $message =
                "Your order #" .
                str_pad((string) $order_id, 4, "0", STR_PAD_LEFT) .
                " is now pending.";

            break;

        case "out for delivery":
            $title = "Your Order Is Out for Delivery";

            $message =
                "Your order #" .
                str_pad((string) $order_id, 4, "0", STR_PAD_LEFT) .
                " is now out for delivery.";

            break;

        case "completed":
            $title = "Order Delivered";

            $message =
                "Your order #" .
                str_pad((string) $order_id, 4, "0", STR_PAD_LEFT) .
                " has been delivered.";

            break;

        case "cancelled":
            $title = "Order Cancelled";

            $message =
                "Your order #" .
                str_pad((string) $order_id, 4, "0", STR_PAD_LEFT) .
                " has been cancelled.";

            break;
    }


    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate notification for the same status
    |--------------------------------------------------------------------------
    */

    $checkNotificationQuery = "
        SELECT notification_id
        FROM notifications
        WHERE client_id = ?
          AND order_id = ?
          AND message = ?
        LIMIT 1
    ";

    $checkNotificationStmt = $conn->prepare(
        $checkNotificationQuery
    );

    if (!$checkNotificationStmt) {
        throw new Exception(
            "Failed to prepare notification check: " .
                $conn->error
        );
    }

    $checkNotificationStmt->bind_param(
        "iis",
        $client_id,
        $order_id,
        $message
    );

    if (!$checkNotificationStmt->execute()) {
        throw new Exception(
            "Failed to check notification: " .
                $checkNotificationStmt->error
        );
    }

    $notificationResult =
        $checkNotificationStmt->get_result();

    $notificationExists =
        $notificationResult->num_rows > 0;

    $checkNotificationStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Insert notification
    |--------------------------------------------------------------------------
    */

    $notificationCreated = false;

    if (!$notificationExists) {

        $notificationQuery = "
            INSERT INTO notifications
            (
                client_id,
                order_id,
                title,
                message,
                notification_type
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                'unread'
            )
        ";

        $notificationStmt = $conn->prepare(
            $notificationQuery
        );

        if (!$notificationStmt) {
            throw new Exception(
                "Failed to prepare notification insert: " .
                    $conn->error
            );
        }

        $notificationStmt->bind_param(
            "iiss",
            $client_id,
            $order_id,
            $title,
            $message
        );

        if (!$notificationStmt->execute()) {
            throw new Exception(
                "Failed to create notification: " .
                    $notificationStmt->error
            );
        }

        $notificationStmt->close();

        $notificationCreated = true;
    }


    /*
    |--------------------------------------------------------------------------
    | Return success
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Order status updated successfully.",
        "order_id" => $order_id,
        "client_id" => $client_id,
        "previous_status" => $previousStatus,
        "order_status" => $order_status,
        "notification_created" => $notificationCreated
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