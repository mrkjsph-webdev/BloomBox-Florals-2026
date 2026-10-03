<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Paymongo-Signature");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "client_db.php";
require_once "paymongo_config.php";


/*
|--------------------------------------------------------------------------
| Only POST
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Read raw webhook body
|--------------------------------------------------------------------------
*/

$payload =
    file_get_contents("php://input");

if (!$payload) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Empty webhook payload."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get PayMongo signature
|--------------------------------------------------------------------------
*/

$signatureHeader =
    $_SERVER["HTTP_PAYMONGO_SIGNATURE"]
    ?? "";

if ($signatureHeader === "") {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
        "Missing Paymongo-Signature header."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Parse signature
|--------------------------------------------------------------------------
|
| PayMongo sends:
|
| t=timestamp,te=test_signature,li=live_signature
|
*/

$signatureParts = [];

foreach (
    explode(",", $signatureHeader)
    as $part
) {

    $pair =
        explode(
            "=",
            $part,
            2
        );

    if (count($pair) === 2) {

        $signatureParts[trim($pair[0])] =
            trim($pair[1]);
    }
}

$timestamp =
    $signatureParts["t"]
    ?? "";

$testSignature =
    $signatureParts["te"]
    ?? "";

$liveSignature =
    $signatureParts["li"]
    ?? "";


/*
|--------------------------------------------------------------------------
| Select test/live signature
|--------------------------------------------------------------------------
*/

$providedSignature = "";

if (
    defined("PAYMONGO_SECRET_KEY") &&
    strpos(
        PAYMONGO_SECRET_KEY,
        "sk_test_"
    ) === 0
) {

    $providedSignature =
        $testSignature;
} else {

    $providedSignature =
        $liveSignature;
}

if (
    $timestamp === "" ||
    $providedSignature === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
        "Invalid PayMongo signature header."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Optional replay protection
|--------------------------------------------------------------------------
|
| Reject requests older than 5 minutes.
|
*/

$timestampInteger =
    (int) $timestamp;

if ($timestampInteger > 0) {

    $timeDifference =
        abs(
            time() -
                $timestampInteger
        );

    if ($timeDifference > 300) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" =>
            "Webhook timestamp is too old."
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Build expected signature
|--------------------------------------------------------------------------
*/

$signedPayload =
    $timestamp .
    "." .
    $payload;

$expectedSignature =
    hash_hmac(
        "sha256",
        $signedPayload,
        PAYMONGO_WEBHOOK_SECRET
    );


/*
|--------------------------------------------------------------------------
| Verify signature
|--------------------------------------------------------------------------
*/

if (
    !hash_equals(
        $expectedSignature,
        $providedSignature
    )
) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" =>
        "Invalid webhook signature."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Decode webhook
|--------------------------------------------------------------------------
*/

$data =
    json_decode(
        $payload,
        true
    );

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
        "Invalid webhook JSON."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get event type
|--------------------------------------------------------------------------
*/

$eventAttributes =
    $data["data"]["attributes"]
    ?? [];

$eventType =
    $eventAttributes["type"]
    ?? "";


/*
|--------------------------------------------------------------------------
| Only process payment.paid
|--------------------------------------------------------------------------
*/

if ($eventType !== "payment.paid") {

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "message" =>
        "Webhook received. No order fulfillment required.",
        "event_type" =>
        $eventType
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get payment resource
|--------------------------------------------------------------------------
*/

$paymentResource =
    $eventAttributes["data"]
    ?? [];

$paymentId =
    $paymentResource["id"]
    ?? null;

$paymentAttributes =
    $paymentResource["attributes"]
    ?? [];

if (!is_array($paymentAttributes)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
        "Invalid payment resource."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Verify payment status
|--------------------------------------------------------------------------
*/

$paymentStatus =
    $paymentAttributes["status"]
    ?? "";

if ($paymentStatus !== "paid") {

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "message" =>
        "Payment event received but payment is not marked paid.",
        "payment_status" =>
        $paymentStatus
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Verify QR Ph
|--------------------------------------------------------------------------
*/

$source =
    $paymentAttributes["source"]
    ?? [];

$sourceType =
    is_array($source)
    ? ($source["type"] ?? "")
    : "";

if ($sourceType !== "qrph") {

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "message" =>
        "Payment is not a QR Ph payment. No QR Ph order was fulfilled.",
        "source_type" =>
        $sourceType
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Payment Intent ID
|--------------------------------------------------------------------------
*/

$paymentIntentId =
    $paymentAttributes["payment_intent_id"]
    ?? "";

if ($paymentIntentId === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
        "Payment Intent ID was not included in the payment event."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Begin transaction
|--------------------------------------------------------------------------
*/

$conn->begin_transaction();

try {

    /*
    |--------------------------------------------------------------------------
    | Find and lock order
    |--------------------------------------------------------------------------
    */

    $orderQuery = "
        SELECT
            order_id,
            client_id,
            payment_id,
            order_status,
            payment_status,
            unit_price,
            paymongo_payment_intent_id,
            paymongo_payment_id
        FROM orders
        WHERE paymongo_payment_intent_id = ?
        LIMIT 1
        FOR UPDATE
    ";

    $orderStmt =
        $conn->prepare(
            $orderQuery
        );

    if (!$orderStmt) {
        throw new Exception(
            "Failed to prepare order query: " .
                $conn->error
        );
    }

    $orderStmt->bind_param(
        "s",
        $paymentIntentId
    );

    if (!$orderStmt->execute()) {
        throw new Exception(
            "Failed to execute order query: " .
                $orderStmt->error
        );
    }

    $orderResult =
        $orderStmt->get_result();

    if (
        $orderResult->num_rows === 0
    ) {

        $orderStmt->close();

        throw new Exception(
            "No BloomBox order was found for Payment Intent " .
                $paymentIntentId .
                "."
        );
    }

    $order =
        $orderResult->fetch_assoc();

    $orderStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate fulfillment
    |--------------------------------------------------------------------------
    */

    if (
        ($order["payment_status"] ?? "")
        === "paid"
    ) {

        $conn->commit();

        http_response_code(200);

        echo json_encode([
            "success" => true,
            "message" =>
            "Order was already marked as paid.",
            "order_id" =>
            (int) $order["order_id"]
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Verify PayMongo payment amount
    |--------------------------------------------------------------------------
    */

    $paidAmount =
        (int) (
            $paymentAttributes["amount"]
            ?? 0
        );

    $expectedAmount =
        (int) round(
            ((float) $order["unit_price"]) *
                100
        );

    if (
        $paidAmount !==
        $expectedAmount
    ) {

        throw new Exception(
            "Payment amount does not match the order amount."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Store PayMongo payment ID and mark paid
    |--------------------------------------------------------------------------
    */

    $updatePaymentQuery = "
        UPDATE orders
        SET
            payment_status = 'paid',
            paymongo_payment_id = ?
        WHERE order_id = ?
    ";

    $updatePaymentStmt =
        $conn->prepare(
            $updatePaymentQuery
        );

    if (!$updatePaymentStmt) {
        throw new Exception(
            "Failed to prepare payment status update: " .
                $conn->error
        );
    }

    $orderId =
        (int) $order["order_id"];

    $updatePaymentStmt->bind_param(
        "si",
        $paymentId,
        $orderId
    );

    if (!$updatePaymentStmt->execute()) {
        throw new Exception(
            "Failed to mark order as paid: " .
                $updatePaymentStmt->error
        );
    }

    $updatePaymentStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Get order items
    |--------------------------------------------------------------------------
    */

    $itemsQuery = "
        SELECT
            order_id,
            item_name,
            quantity,
            customization
        FROM order_items
        WHERE order_id = ?
    ";

    $itemsStmt =
        $conn->prepare(
            $itemsQuery
        );

    if (!$itemsStmt) {
        throw new Exception(
            "Failed to prepare order items query: " .
                $conn->error
        );
    }

    $itemsStmt->bind_param(
        "i",
        $orderId
    );

    if (!$itemsStmt->execute()) {
        throw new Exception(
            "Failed to execute order items query: " .
                $itemsStmt->error
        );
    }

    $itemsResult =
        $itemsStmt->get_result();

    $orderItems = [];

    while (
        $item =
        $itemsResult->fetch_assoc()
    ) {

        $orderItems[] =
            $item;
    }

    $itemsStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Reconstruct flower quantities
    |--------------------------------------------------------------------------
    */

    $flowerQuantities = [];

    foreach (
        $orderItems as $item
    ) {

        $customization =
            $item["customization"]
            ?? null;

        if (!$customization) {
            continue;
        }

        $decoded =
            json_decode(
                $customization,
                true
            );

        if (!is_array($decoded)) {
            continue;
        }

        $flowers =
            $decoded["flowers"]
            ?? [];

        if (!is_array($flowers)) {
            continue;
        }

        $itemQuantity =
            max(
                1,
                (int) (
                    $item["quantity"]
                    ?? 1
                )
            );

        foreach (
            $flowers as $flower
        ) {

            if (!is_array($flower)) {
                continue;
            }

            $flowerId =
                (int) (
                    $flower["flower_id"]
                    ?? 0
                );

            $flowerQuantity =
                (int) (
                    $flower["quantity"]
                    ?? 0
                );

            if (
                $flowerId <= 0 ||
                $flowerQuantity <= 0
            ) {
                continue;
            }

            $totalFlowerQuantity =
                $flowerQuantity *
                $itemQuantity;

            if (
                !isset(
                    $flowerQuantities[$flowerId]
                )
            ) {

                $flowerQuantities[$flowerId] = 0;
            }

            $flowerQuantities[$flowerId] +=
                $totalFlowerQuantity;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Decrease inventory
    |--------------------------------------------------------------------------
    */

    foreach (
        $flowerQuantities
        as $flower_id => $quantity
    ) {

        $inventoryQuery = "
            SELECT
                flower_id,
                flower_name,
                stock
            FROM bbf_inventorydb.flower_inventory
            WHERE flower_id = ?
            FOR UPDATE
        ";

        $inventoryStmt =
            $conn->prepare(
                $inventoryQuery
            );

        if (!$inventoryStmt) {
            throw new Exception(
                "Failed to prepare inventory query: " .
                    $conn->error
            );
        }

        $inventoryStmt->bind_param(
            "i",
            $flower_id
        );

        if (!$inventoryStmt->execute()) {
            throw new Exception(
                "Failed to check inventory: " .
                    $inventoryStmt->error
            );
        }

        $inventoryResult =
            $inventoryStmt->get_result();

        if (
            $inventoryResult->num_rows === 0
        ) {

            $inventoryStmt->close();

            throw new Exception(
                "Flower ID " .
                    $flower_id .
                    " does not exist."
            );
        }

        $inventory =
            $inventoryResult->fetch_assoc();

        $inventoryStmt->close();

        $currentStock =
            (int) $inventory["stock"];

        if (
            $currentStock <
            $quantity
        ) {

            throw new Exception(
                "Not enough stock for " .
                    $inventory["flower_name"] .
                    ". Available: " .
                    $currentStock .
                    ", required: " .
                    $quantity .
                    "."
            );
        }


        $updateInventoryQuery = "
            UPDATE bbf_inventorydb.flower_inventory
            SET stock = stock - ?
            WHERE flower_id = ?
              AND stock >= ?
        ";

        $updateInventoryStmt =
            $conn->prepare(
                $updateInventoryQuery
            );

        if (!$updateInventoryStmt) {
            throw new Exception(
                "Failed to prepare inventory update: " .
                    $conn->error
            );
        }

        $updateInventoryStmt->bind_param(
            "iii",
            $quantity,
            $flower_id,
            $quantity
        );

        if (
            !$updateInventoryStmt->execute()
        ) {

            throw new Exception(
                "Failed to update inventory: " .
                    $updateInventoryStmt->error
            );
        }

        if (
            $updateInventoryStmt
            ->affected_rows === 0
        ) {

            $updateInventoryStmt->close();

            throw new Exception(
                "Inventory could not be updated."
            );
        }

        $updateInventoryStmt->close();


        /*
        |--------------------------------------------------------------------------
        | Update popular flowers
        |--------------------------------------------------------------------------
        */

        $popularQuery = "
            SELECT
                popular_id
            FROM bbf_inventorydb.popular_flowers
            WHERE flower_id = ?
            LIMIT 1
            FOR UPDATE
        ";

        $popularStmt =
            $conn->prepare(
                $popularQuery
            );

        if (!$popularStmt) {
            throw new Exception(
                "Failed to prepare popular flower query: " .
                    $conn->error
            );
        }

        $popularStmt->bind_param(
            "i",
            $flower_id
        );

        if (!$popularStmt->execute()) {
            throw new Exception(
                "Failed to check popular flower: " .
                    $popularStmt->error
            );
        }

        $popularResult =
            $popularStmt->get_result();

        if (
            $popularResult->num_rows > 0
        ) {

            $popular =
                $popularResult->fetch_assoc();

            $popularStmt->close();

            $popularId =
                (int) $popular["popular_id"];

            $updatePopularQuery = "
                UPDATE bbf_inventorydb.popular_flowers
                SET amount_sold =
                    amount_sold + ?
                WHERE popular_id = ?
            ";

            $updatePopularStmt =
                $conn->prepare(
                    $updatePopularQuery
                );

            if (!$updatePopularStmt) {
                throw new Exception(
                    "Failed to prepare popular flower update: " .
                        $conn->error
                );
            }

            $updatePopularStmt->bind_param(
                "ii",
                $quantity,
                $popularId
            );

            if (
                !$updatePopularStmt->execute()
            ) {

                throw new Exception(
                    "Failed to update popular flowers: " .
                        $updatePopularStmt->error
                );
            }

            $updatePopularStmt->close();
        } else {

            $popularStmt->close();

            $insertPopularQuery = "
                INSERT INTO bbf_inventorydb.popular_flowers
                (
                    flower_id,
                    amount_sold
                )
                VALUES
                (
                    ?,
                    ?
                )
            ";

            $insertPopularStmt =
                $conn->prepare(
                    $insertPopularQuery
                );

            if (!$insertPopularStmt) {
                throw new Exception(
                    "Failed to prepare popular flower insert: " .
                        $conn->error
                );
            }

            $insertPopularStmt->bind_param(
                "ii",
                $flower_id,
                $quantity
            );

            if (
                !$insertPopularStmt->execute()
            ) {

                throw new Exception(
                    "Failed to create popular flower record: " .
                        $insertPopularStmt->error
                );
            }

            $insertPopularStmt->close();
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Create notification
    |--------------------------------------------------------------------------
    */

    $notificationTitle =
        "Order Confirmed";

    $notificationMessage =
        "Your order #" .
        str_pad(
            (string) $orderId,
            4,
            "0",
            STR_PAD_LEFT
        ) .
        " has been successfully paid.";

    $notificationQuery = "
        INSERT INTO notifications
        (
            client_id,
            order_id,
            title,
            message,
            type
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

    $notificationStmt =
        $conn->prepare(
            $notificationQuery
        );

    if (!$notificationStmt) {
        throw new Exception(
            "Failed to prepare notification query: " .
                $conn->error
        );
    }

    $notificationClientId =
        (int) $order["client_id"];

    $notificationStmt->bind_param(
        "iiss",
        $notificationClientId,
        $orderId,
        $notificationTitle,
        $notificationMessage
    );

    if (
        !$notificationStmt->execute()
    ) {

        throw new Exception(
            "Failed to create notification: " .
                $notificationStmt->error
        );
    }

    $notificationStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    $conn->commit();

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "message" =>
        "QR Ph payment confirmed.",
        "order_id" =>
        $orderId,
        "payment_status" =>
        "paid",
        "paymongo_payment_id" =>
        $paymentId,
        "payment_intent_id" =>
        $paymentIntentId
    ]);
} catch (Exception $error) {

    $conn->rollback();

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
        $error->getMessage()
    ]);
}

$conn->close();
