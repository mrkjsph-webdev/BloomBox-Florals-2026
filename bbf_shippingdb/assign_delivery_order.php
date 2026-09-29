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
    http_response_code(405);

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

    $order_id = isset($input["order_id"])
        ? (int) $input["order_id"]
        : 0;

    if ($rider_id <= 0) {
        throw new Exception("Delivery rider ID is required.");
    }

    if ($order_id <= 0) {
        throw new Exception("Order ID is required.");
    }

    /*
     * Check that the delivery rider exists.
     */
    $riderStmt = $conn->prepare("
        SELECT rider_id, name
        FROM delivery_rider
        WHERE rider_id = ?
        LIMIT 1
    ");

    if (!$riderStmt) {
        throw new Exception("Failed to prepare rider query.");
    }

    $riderStmt->bind_param("i", $rider_id);

    if (!$riderStmt->execute()) {
        throw new Exception("Failed to verify delivery rider.");
    }

    $riderResult = $riderStmt->get_result();

    if ($riderResult->num_rows === 0) {
        $riderStmt->close();

        throw new Exception("Delivery rider not found.");
    }

    $rider = $riderResult->fetch_assoc();

    $riderStmt->close();

    /*
     * Check the order in the client database.
     *
     * The delivery_orders table is in bbf_shippingdb,
     * while orders is in bbf_clientdb.
     */
    $clientConn = new mysqli(
        "localhost",
        "root",
        "",
        "bbf_clientdb"
    );

    if ($clientConn->connect_error) {
        throw new Exception(
            "Failed to connect to the client database."
        );
    }

    $clientConn->set_charset("utf8mb4");

    $orderStmt = $clientConn->prepare("
        SELECT
            order_id,
            order_status
        FROM orders
        WHERE order_id = ?
        LIMIT 1
    ");

    if (!$orderStmt) {
        $clientConn->close();

        throw new Exception("Failed to prepare order query.");
    }

    $orderStmt->bind_param("i", $order_id);

    if (!$orderStmt->execute()) {
        $orderStmt->close();
        $clientConn->close();

        throw new Exception("Failed to verify order.");
    }

    $orderResult = $orderStmt->get_result();

    if ($orderResult->num_rows === 0) {
        $orderStmt->close();
        $clientConn->close();

        throw new Exception("Order not found.");
    }

    $order = $orderResult->fetch_assoc();

    $orderStmt->close();
    $clientConn->close();

    /*
     * Only pending orders can be assigned.
     */
    if (strtolower(trim($order["order_status"])) !== "pending") {
        throw new Exception(
            "Only pending orders can be assigned to a delivery rider."
        );
    }

    /*
     * Check whether this order is already assigned.
     *
     * This allows the same rider to have many orders,
     * but prevents the same order from being assigned
     * more than once.
     */
    $existingStmt = $conn->prepare("
        SELECT
            delivery_id,
            rider_id,
            delivery_status
        FROM delivery_orders
        WHERE order_id = ?
        ORDER BY delivery_id DESC
        LIMIT 1
    ");

    if (!$existingStmt) {
        throw new Exception(
            "Failed to prepare existing assignment query."
        );
    }

    $existingStmt->bind_param("i", $order_id);

    if (!$existingStmt->execute()) {
        $existingStmt->close();

        throw new Exception(
            "Failed to check existing order assignment."
        );
    }

    $existingResult = $existingStmt->get_result();

    if ($existingResult->num_rows > 0) {
        $existing = $existingResult->fetch_assoc();

        $existingStmt->close();

        if (
            $existing["delivery_status"] !== "cancelled"
        ) {
            throw new Exception(
                "This order is already assigned to a delivery rider."
            );
        }
    } else {
        $existingStmt->close();
    }

    /*
     * Assign the order to the rider.
     *
     * The rider can have multiple rows/orders.
     */
    $insertStmt = $conn->prepare("
        INSERT INTO delivery_orders
        (
            rider_id,
            order_id,
            delivery_status,
            assigned_at
        )
        VALUES
        (
            ?,
            ?,
            'pending',
            CURRENT_TIMESTAMP
        )
    ");

    if (!$insertStmt) {
        throw new Exception(
            "Failed to prepare delivery assignment."
        );
    }

    $insertStmt->bind_param(
        "ii",
        $rider_id,
        $order_id
    );

    if (!$insertStmt->execute()) {
        $insertStmt->close();

        throw new Exception(
            "Failed to assign order to delivery rider."
        );
    }

    $delivery_id = $insertStmt->insert_id;

    $insertStmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Order assigned successfully.",
        "assignment" => [
            "delivery_id" => (int) $delivery_id,
            "rider_id" => (int) $rider_id,
            "rider_name" => $rider["name"],
            "order_id" => (int) $order_id,
            "delivery_status" => "pending"
        ]
    ]);
} catch (Exception $error) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => $error->getMessage()
    ]);
}

$conn->close();
