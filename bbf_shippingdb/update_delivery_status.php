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


/*
|--------------------------------------------------------------------------
| Client database connection
|--------------------------------------------------------------------------
*/

$clientHost = "localhost";
$clientUsername = "root";
$clientPassword = "";
$clientDatabase = "bbf_clientdb";

$clientConn = new mysqli(
    $clientHost,
    $clientUsername,
    $clientPassword,
    $clientDatabase
);

if ($clientConn->connect_error) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Client database connection failed."
    ]);

    exit;
}

$clientConn->set_charset("utf8mb4");


try {

    /*
    |--------------------------------------------------------------------------
    | Read request
    |--------------------------------------------------------------------------
    */

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        throw new Exception("Invalid request data.");
    }


    $delivery_id = isset($input["delivery_id"])
        ? (int) $input["delivery_id"]
        : 0;

    $rider_id = isset($input["rider_id"])
        ? (int) $input["rider_id"]
        : 0;

    $order_id = isset($input["order_id"])
        ? (int) $input["order_id"]
        : 0;

    $delivery_status =
        strtolower(
            trim($input["delivery_status"] ?? "")
        );


    /*
    |--------------------------------------------------------------------------
    | Validate required fields
    |--------------------------------------------------------------------------
    */

    if ($delivery_id <= 0) {
        throw new Exception("Delivery ID is required.");
    }

    if ($rider_id <= 0) {
        throw new Exception("Delivery rider ID is required.");
    }

    if ($order_id <= 0) {
        throw new Exception("Order ID is required.");
    }


    $allowedStatuses = [
        "pending",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled"
    ];

    if (!in_array($delivery_status, $allowedStatuses, true)) {
        throw new Exception("Invalid delivery status.");
    }


    /*
    |--------------------------------------------------------------------------
    | Verify that the delivery belongs to this rider
    |--------------------------------------------------------------------------
    */

    $verifyStmt = $conn->prepare("
        SELECT
            delivery_id,
            rider_id,
            order_id,
            delivery_status
        FROM delivery_orders
        WHERE delivery_id = ?
          AND rider_id = ?
          AND order_id = ?
        LIMIT 1
    ");

    if (!$verifyStmt) {
        throw new Exception(
            "Failed to prepare delivery verification."
        );
    }

    $verifyStmt->bind_param(
        "iii",
        $delivery_id,
        $rider_id,
        $order_id
    );

    if (!$verifyStmt->execute()) {
        throw new Exception(
            "Failed to verify delivery assignment."
        );
    }

    $verifyResult = $verifyStmt->get_result();

    if ($verifyResult->num_rows === 0) {

        $verifyStmt->close();

        throw new Exception(
            "This delivery is not assigned to this rider."
        );
    }

    $currentDelivery =
        $verifyResult->fetch_assoc();

    $verifyStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Prevent changing completed/cancelled deliveries
    |--------------------------------------------------------------------------
    */

    $currentDeliveryStatus =
        strtolower(
            trim(
                $currentDelivery["delivery_status"] ?? ""
            )
        );

    if (
        $currentDeliveryStatus === "delivered" ||
        $currentDeliveryStatus === "cancelled"
    ) {
        throw new Exception(
            "This delivery has already been completed or cancelled."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Update delivery status
    |--------------------------------------------------------------------------
    */

    if ($delivery_status === "picked_up") {

        $updateStmt = $conn->prepare("
            UPDATE delivery_orders
            SET
                delivery_status = ?,
                picked_up_at = COALESCE(
                    picked_up_at,
                    CURRENT_TIMESTAMP
                )
            WHERE delivery_id = ?
              AND rider_id = ?
              AND order_id = ?
        ");

        if (!$updateStmt) {
            throw new Exception(
                "Failed to prepare pickup status update."
            );
        }

        $updateStmt->bind_param(
            "siii",
            $delivery_status,
            $delivery_id,
            $rider_id,
            $order_id
        );

    } elseif ($delivery_status === "delivered") {

        $updateStmt = $conn->prepare("
            UPDATE delivery_orders
            SET
                delivery_status = ?,
                picked_up_at = COALESCE(
                    picked_up_at,
                    CURRENT_TIMESTAMP
                ),
                delivered_at = CURRENT_TIMESTAMP
            WHERE delivery_id = ?
              AND rider_id = ?
              AND order_id = ?
        ");

        if (!$updateStmt) {
            throw new Exception(
                "Failed to prepare delivered status update."
            );
        }

        $updateStmt->bind_param(
            "siii",
            $delivery_status,
            $delivery_id,
            $rider_id,
            $order_id
        );

    } else {

        $updateStmt = $conn->prepare("
            UPDATE delivery_orders
            SET
                delivery_status = ?
            WHERE delivery_id = ?
              AND rider_id = ?
              AND order_id = ?
        ");

        if (!$updateStmt) {
            throw new Exception(
                "Failed to prepare delivery status update."
            );
        }

        $updateStmt->bind_param(
            "siii",
            $delivery_status,
            $delivery_id,
            $rider_id,
            $order_id
        );
    }


    if (!$updateStmt->execute()) {
        throw new Exception(
            "Failed to update delivery status."
        );
    }

    $updateStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Convert delivery status to client order status
    |
    | Shipping DB:
    |   pending
    |   picked_up
    |   in_transit
    |   delivered
    |   cancelled
    |
    | Client DB:
    |   pending
    |   out for delivery
    |   completed
    |   cancelled
    |--------------------------------------------------------------------------
    */

    $orderStatus = "pending";

    switch ($delivery_status) {

        case "pending":
            $orderStatus = "pending";
            break;

        case "picked_up":
            $orderStatus = "out for delivery";
            break;

        case "in_transit":
            $orderStatus = "out for delivery";
            break;

        case "delivered":
            $orderStatus = "completed";
            break;

        case "cancelled":
            $orderStatus = "cancelled";
            break;
    }


    /*
    |--------------------------------------------------------------------------
    | Get the current client order status
    |--------------------------------------------------------------------------
    */

    $oldOrderStatus = null;
    $clientId = 0;

    $oldOrderStmt = $clientConn->prepare("
        SELECT
            client_id,
            order_status
        FROM orders
        WHERE order_id = ?
        LIMIT 1
    ");

    if (!$oldOrderStmt) {
        throw new Exception(
            "Failed to prepare current order query."
        );
    }

    $oldOrderStmt->bind_param(
        "i",
        $order_id
    );

    if (!$oldOrderStmt->execute()) {
        throw new Exception(
            "Failed to retrieve current order status."
        );
    }

    $oldOrderResult =
        $oldOrderStmt->get_result();

    if ($oldOrderResult->num_rows === 0) {

        $oldOrderStmt->close();

        throw new Exception(
            "Order not found."
        );
    }

    $oldOrder =
        $oldOrderResult->fetch_assoc();

    $oldOrderStatus =
        strtolower(
            trim(
                $oldOrder["order_status"] ?? ""
            )
        );

    $clientId =
        (int) $oldOrder["client_id"];

    $oldOrderStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Update client order status
    |--------------------------------------------------------------------------
    */

    $orderStmt = $clientConn->prepare("
        UPDATE orders
        SET order_status = ?
        WHERE order_id = ?
        LIMIT 1
    ");

    if (!$orderStmt) {
        throw new Exception(
            "Failed to prepare order status update."
        );
    }

    $orderStmt->bind_param(
        "si",
        $orderStatus,
        $order_id
    );

    if (!$orderStmt->execute()) {
        throw new Exception(
            "Delivery status was updated, but the order status could not be updated."
        );
    }

    $orderStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Create customer notification only when the order status changes
    |--------------------------------------------------------------------------
    */

    if ($oldOrderStatus !== $orderStatus) {

        $notificationTitle = "Order Status Updated";

        $statusLabel = "Pending";

        switch ($orderStatus) {

            case "pending":
                $statusLabel = "Pending";
                break;

            case "out for delivery":
                $statusLabel = "Out for Delivery";
                break;

            case "completed":
                $statusLabel = "Delivered";
                break;

            case "cancelled":
                $statusLabel = "Cancelled";
                break;
        }

        $notificationMessage =
            "Your order #" .
            $order_id .
            " is now " .
            $statusLabel .
            ".";


        $notificationStmt = $clientConn->prepare("
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
        ");

        if (!$notificationStmt) {
            throw new Exception(
                "Failed to prepare order notification."
            );
        }

        $notificationStmt->bind_param(
            "iiss",
            $clientId,
            $order_id,
            $notificationTitle,
            $notificationMessage
        );

        if (!$notificationStmt->execute()) {
            throw new Exception(
                "Order status was updated, but the notification could not be created."
            );
        }

        $notificationStmt->close();
    }


    /*
    |--------------------------------------------------------------------------
    | Get updated delivery
    |--------------------------------------------------------------------------
    */

    $resultStmt = $conn->prepare("
        SELECT
            delivery_id,
            rider_id,
            order_id,
            delivery_status,
            assigned_at,
            picked_up_at,
            delivered_at
        FROM delivery_orders
        WHERE delivery_id = ?
        LIMIT 1
    ");

    if (!$resultStmt) {
        throw new Exception(
            "Failed to prepare updated delivery query."
        );
    }

    $resultStmt->bind_param(
        "i",
        $delivery_id
    );

    if (!$resultStmt->execute()) {
        throw new Exception(
            "Failed to retrieve updated delivery."
        );
    }

    $result =
        $resultStmt->get_result();

    $delivery =
        $result->fetch_assoc();

    $resultStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,

        "message" =>
            "Delivery status updated successfully.",

        "delivery" => [
            "delivery_id" =>
                (int) $delivery["delivery_id"],

            "rider_id" =>
                (int) $delivery["rider_id"],

            "order_id" =>
                (int) $delivery["order_id"],

            "delivery_status" =>
                $delivery["delivery_status"],

            "assigned_at" =>
                $delivery["assigned_at"],

            "picked_up_at" =>
                $delivery["picked_up_at"],

            "delivered_at" =>
                $delivery["delivered_at"]
        ],

        "old_order_status" =>
            $oldOrderStatus,

        "order_status" =>
            $orderStatus,

        "notification_created" =>
            $oldOrderStatus !== $orderStatus
    ]);

} catch (Exception $error) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $error->getMessage()
    ]);
}


$conn->close();
$clientConn->close();

?>