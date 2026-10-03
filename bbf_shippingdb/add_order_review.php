<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

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
    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($data)) {
        throw new Exception("Invalid JSON request.");
    }

    $order_id = isset($data["order_id"])
        ? (int) $data["order_id"]
        : 0;

    $rating = isset($data["rating"])
        ? (int) $data["rating"]
        : 0;

    $review_comment = trim(
        $data["review_comment"] ?? ""
    );

    if ($order_id <= 0) {
        throw new Exception("Invalid order ID.");
    }

    if ($rating < 1 || $rating > 5) {
        throw new Exception(
            "Rating must be between 1 and 5 stars."
        );
    }

    if ($review_comment === "") {
        throw new Exception(
            "Review comment is required."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find the rider assigned to this order
    |--------------------------------------------------------------------------
    */

    $riderStmt = $conn->prepare("
        SELECT
            rider_id
        FROM delivery_orders
        WHERE order_id = ?
        ORDER BY delivery_id DESC
        LIMIT 1
    ");

    if (!$riderStmt) {
        throw new Exception(
            "Failed to prepare rider query: " .
            $conn->error
        );
    }

    $riderStmt->bind_param(
        "i",
        $order_id
    );

    if (!$riderStmt->execute()) {
        throw new Exception(
            "Failed to find delivery rider."
        );
    }

    $riderResult = $riderStmt->get_result();

    if ($riderResult->num_rows === 0) {
        $riderStmt->close();

        throw new Exception(
            "No delivery rider is assigned to this order."
        );
    }

    $rider = $riderResult->fetch_assoc();

    $rider_id = (int) $rider["rider_id"];

    $riderStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate reviews
    |--------------------------------------------------------------------------
    */

    $existingStmt = $conn->prepare("
        SELECT
            review_id
        FROM review_order
        WHERE order_id = ?
        LIMIT 1
    ");

    if (!$existingStmt) {
        throw new Exception(
            "Failed to prepare review check."
        );
    }

    $existingStmt->bind_param(
        "i",
        $order_id
    );

    if (!$existingStmt->execute()) {
        throw new Exception(
            "Failed to check existing review."
        );
    }

    $existingResult = $existingStmt->get_result();

    if ($existingResult->num_rows > 0) {
        $existingStmt->close();

        throw new Exception(
            "This order has already been reviewed."
        );
    }

    $existingStmt->close();

    /*
    |--------------------------------------------------------------------------
    | Save review
    |--------------------------------------------------------------------------
    */

    $reviewStmt = $conn->prepare("
        INSERT INTO review_order
        (
            rider_id,
            order_id,
            rating,
            review_comment
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?
        )
    ");

    if (!$reviewStmt) {
        throw new Exception(
            "Failed to prepare review insertion: " .
            $conn->error
        );
    }

    $reviewStmt->bind_param(
        "iiis",
        $rider_id,
        $order_id,
        $rating,
        $review_comment
    );

    if (!$reviewStmt->execute()) {
        throw new Exception(
            "Failed to save review: " .
            $reviewStmt->error
        );
    }

    $review_id = $reviewStmt->insert_id;

    $reviewStmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Review submitted successfully.",
        "review" => [
            "review_id" => (int) $review_id,
            "rider_id" => $rider_id,
            "order_id" => $order_id,
            "rating" => $rating,
            "review_comment" => $review_comment
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

?>