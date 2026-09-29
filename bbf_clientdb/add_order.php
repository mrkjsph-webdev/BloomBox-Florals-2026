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
        "message" => "add_order.php is working, but the request method is not POST."
    ]);
    exit;
}

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!is_array($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON received.",
        "raw_data" => $rawData
    ]);
    exit;
}

$client_id = isset($data["client_id"])
    ? (int) $data["client_id"]
    : 0;

$payment_id = isset($data["payment_id"])
    ? (int) $data["payment_id"]
    : 0;

$unit_price = isset($data["unit_price"])
    ? (float) $data["unit_price"]
    : 0;

$flowers = isset($data["flowers"]) && is_array($data["flowers"])
    ? $data["flowers"]
    : [];

$orderItems = isset($data["items"]) && is_array($data["items"])
    ? $data["items"]
    : [];

$delivery_method = trim($data["delivery_method"] ?? "standard");

/*
|--------------------------------------------------------------------------
| Validate client ID
|--------------------------------------------------------------------------
*/

if ($client_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid client_id.",
        "received_client_id" => $client_id
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Validate payment ID
|--------------------------------------------------------------------------
*/

if ($payment_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid payment_id.",
        "received_payment_id" => $payment_id
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Validate price
|--------------------------------------------------------------------------
*/

if ($unit_price <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid unit_price.",
        "received_unit_price" => $unit_price
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Validate order items
|--------------------------------------------------------------------------
*/

if (count($orderItems) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "No order items were received."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Validate database connection
|--------------------------------------------------------------------------
*/

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed.",
        "database_error" => $conn->connect_error
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Prepare and combine flower quantities
|--------------------------------------------------------------------------
*/

$flowerQuantities = [];

foreach ($flowers as $flower) {

    if (!is_array($flower)) {
        continue;
    }

    $flower_id = isset($flower["flower_id"])
        ? (int) $flower["flower_id"]
        : 0;

    $quantity = isset($flower["quantity"])
        ? (int) $flower["quantity"]
        : 0;

    if ($flower_id <= 0 || $quantity <= 0) {
        continue;
    }

    if (!isset($flowerQuantities[$flower_id])) {
        $flowerQuantities[$flower_id] = 0;
    }

    $flowerQuantities[$flower_id] += $quantity;
}


/*
|--------------------------------------------------------------------------
| Start transaction
|--------------------------------------------------------------------------
*/

$conn->begin_transaction();

try {

    /*
    |--------------------------------------------------------------------------
    | Check client
    |--------------------------------------------------------------------------
    */

    $clientQuery = "
        SELECT client_id
        FROM Client
        WHERE client_id = ?
        LIMIT 1
    ";

    $clientStmt = $conn->prepare($clientQuery);

    if (!$clientStmt) {
        throw new Exception(
            "Failed to prepare client query: " . $conn->error
        );
    }

    $clientStmt->bind_param(
        "i",
        $client_id
    );

    if (!$clientStmt->execute()) {
        throw new Exception(
            "Failed to execute client query: " . $clientStmt->error
        );
    }

    $clientResult = $clientStmt->get_result();

    if ($clientResult->num_rows === 0) {
        $clientStmt->close();

        throw new Exception("Client does not exist.");
    }

    $clientStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Check payment method
    |--------------------------------------------------------------------------
    */

    $paymentQuery = "
        SELECT
            payment_id,
            payment_type,
            gcash_last_four
        FROM payment_methods
        WHERE payment_id = ?
          AND client_id = ?
        LIMIT 1
    ";

    $paymentStmt = $conn->prepare($paymentQuery);

    if (!$paymentStmt) {
        throw new Exception(
            "Failed to prepare payment method query: " . $conn->error
        );
    }

    $paymentStmt->bind_param(
        "ii",
        $payment_id,
        $client_id
    );

    if (!$paymentStmt->execute()) {
        throw new Exception(
            "Failed to verify payment method: " . $paymentStmt->error
        );
    }

    $paymentResult = $paymentStmt->get_result();

    if ($paymentResult->num_rows === 0) {
        $paymentStmt->close();

        throw new Exception(
            "Payment method does not belong to this client."
        );
    }

    $payment = $paymentResult->fetch_assoc();

    $paymentStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Check flower inventory
    |--------------------------------------------------------------------------
    */

    foreach ($flowerQuantities as $flower_id => $quantity) {

        $inventoryQuery = "
            SELECT
                flower_id,
                flower_name,
                stock
            FROM bbf_inventorydb.flower_inventory
            WHERE flower_id = ?
            FOR UPDATE
        ";

        $inventoryStmt = $conn->prepare($inventoryQuery);

        if (!$inventoryStmt) {
            throw new Exception(
                "Failed to prepare inventory query: " . $conn->error
            );
        }

        $inventoryStmt->bind_param(
            "i",
            $flower_id
        );

        if (!$inventoryStmt->execute()) {
            throw new Exception(
                "Failed to check flower inventory: " .
                    $inventoryStmt->error
            );
        }

        $inventoryResult = $inventoryStmt->get_result();

        if ($inventoryResult->num_rows === 0) {
            $inventoryStmt->close();

            throw new Exception(
                "Flower ID {$flower_id} does not exist in inventory."
            );
        }

        $inventory = $inventoryResult->fetch_assoc();

        $inventoryStmt->close();

        $currentStock = (int) $inventory["stock"];

        if ($currentStock < $quantity) {
            throw new Exception(
                "Not enough stock for {$inventory["flower_name"]}. " .
                    "Available: {$currentStock}, requested: {$quantity}."
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Insert order
    |--------------------------------------------------------------------------
    */

    $orderQuery = "
        INSERT INTO orders
        (
            client_id,
            payment_id,
            order_status,
            unit_price
        )
        VALUES
        (
            ?,
            ?,
            'pending',
            ?
        )
    ";

    $orderStmt = $conn->prepare($orderQuery);

    if (!$orderStmt) {
        throw new Exception(
            "Failed to prepare order query: " . $conn->error
        );
    }

    $orderStmt->bind_param(
        "iid",
        $client_id,
        $payment_id,
        $unit_price
    );

    if (!$orderStmt->execute()) {
        throw new Exception(
            "Failed to insert order: " . $orderStmt->error
        );
    }

    $order_id = $orderStmt->insert_id;

    $orderStmt->close();


    /*
    |--------------------------------------------------------------------------
    | Insert order items
    |--------------------------------------------------------------------------
    |
    | order_items is a separate table.
    | It stores the actual items purchased in this order.
    |
    */

    $orderItemQuery = "
        INSERT INTO order_items
        (
            order_id,
            item_name,
            item_image,
            quantity,
            unit_price,
            customization
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    ";

    $orderItemStmt = $conn->prepare($orderItemQuery);

    if (!$orderItemStmt) {
        throw new Exception(
            "Failed to prepare order item query: " . $conn->error
        );
    }

    $itemsSaved = 0;

    foreach ($orderItems as $item) {

        if (!is_array($item)) {
            continue;
        }


        /*
        |----------------------------------------------------------------------
        | Item name
        |----------------------------------------------------------------------
        */

        $itemName =
            $item["name"]
            ?? $item["bouquet_name"]
            ?? $item["template_name"]
            ?? $item["bouquetName"]
            ?? "BloomBox Bouquet";

        $itemName = trim((string) $itemName);

        if ($itemName === "") {
            $itemName = "BloomBox Bouquet";
        }


        /*
        |----------------------------------------------------------------------
        | Item image
        |----------------------------------------------------------------------
        */

        $itemImage =
            $item["image"]
            ?? $item["image_url"]
            ?? $item["flower_image"]
            ?? $item["bouquet_image"]
            ?? null;

        if ($itemImage !== null) {
            $itemImage = (string) $itemImage;
        }


        /*
        |----------------------------------------------------------------------
        | Quantity
        |----------------------------------------------------------------------
        */

        $itemQuantity = isset($item["quantity"])
            ? (int) $item["quantity"]
            : 1;

        if ($itemQuantity <= 0) {
            $itemQuantity = 1;
        }


        /*
        |----------------------------------------------------------------------
        | Unit price
        |----------------------------------------------------------------------
        */

        $itemPrice = 0;

        $possiblePrices = [
            $item["unit_price"] ?? null,
            $item["unitPrice"] ?? null,
            $item["price"] ?? null,
            $item["total_price"] ?? null,
            $item["totalPrice"] ?? null
        ];

        foreach ($possiblePrices as $possiblePrice) {

            if (
                $possiblePrice !== null &&
                $possiblePrice !== "" &&
                is_numeric($possiblePrice)
            ) {
                $parsedPrice = (float) $possiblePrice;

                if ($parsedPrice > 0) {
                    $itemPrice = $parsedPrice;
                    break;
                }
            }
        }


        /*
        |----------------------------------------------------------------------
        | Customization
        |----------------------------------------------------------------------
        */

        $customization = $item["customization"] ?? null;

        if ($customization !== null) {

            if (is_string($customization)) {

                $decodedCustomization = json_decode(
                    $customization,
                    true
                );

                if (
                    is_array($decodedCustomization) ||
                    is_object($decodedCustomization)
                ) {
                    $customizationJson = json_encode(
                        $decodedCustomization,
                        JSON_UNESCAPED_UNICODE
                    );
                } else {
                    $customizationJson = $customization;
                }
            } else {

                $customizationJson = json_encode(
                    $customization,
                    JSON_UNESCAPED_UNICODE
                );
            }
        } else {

            /*
            |------------------------------------------------------------------
            | Fallback: save the complete checkout item.
            |------------------------------------------------------------------
            */

            $customizationJson = json_encode(
                $item,
                JSON_UNESCAPED_UNICODE
            );
        }


        $orderItemStmt->bind_param(
            "issids",
            $order_id,
            $itemName,
            $itemImage,
            $itemQuantity,
            $itemPrice,
            $customizationJson
        );

        if (!$orderItemStmt->execute()) {
            throw new Exception(
                "Failed to save order item: " .
                    $orderItemStmt->error
            );
        }

        $itemsSaved++;
    }

    $orderItemStmt->close();

    if ($itemsSaved === 0) {
        throw new Exception(
            "No valid order items could be saved."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Decrease flower inventory
    |--------------------------------------------------------------------------
    */

    foreach ($flowerQuantities as $flower_id => $quantity) {

        $updateInventoryQuery = "
            UPDATE bbf_inventorydb.flower_inventory
            SET stock = stock - ?
            WHERE flower_id = ?
              AND stock >= ?
        ";

        $updateInventoryStmt = $conn->prepare(
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

        if (!$updateInventoryStmt->execute()) {
            throw new Exception(
                "Failed to update flower stock: " .
                    $updateInventoryStmt->error
            );
        }

        if ($updateInventoryStmt->affected_rows === 0) {
            $updateInventoryStmt->close();

            throw new Exception(
                "Flower stock could not be updated for flower ID " .
                    $flower_id . "."
            );
        }

        $updateInventoryStmt->close();


        /*
        |--------------------------------------------------------------------------
        | Update popular flowers
        |--------------------------------------------------------------------------
        */

        $popularQuery = "
            SELECT popular_id
            FROM bbf_inventorydb.popular_flowers
            WHERE flower_id = ?
            LIMIT 1
            FOR UPDATE
        ";

        $popularStmt = $conn->prepare($popularQuery);

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

        $popularResult = $popularStmt->get_result();

        if ($popularResult->num_rows > 0) {

            $popular = $popularResult->fetch_assoc();

            $popularStmt->close();

            $updatePopularQuery = "
                UPDATE bbf_inventorydb.popular_flowers
                SET amount_sold = amount_sold + ?
                WHERE popular_id = ?
            ";

            $updatePopularStmt = $conn->prepare(
                $updatePopularQuery
            );

            if (!$updatePopularStmt) {
                throw new Exception(
                    "Failed to prepare popular flower update: " .
                        $conn->error
                );
            }

            $popularId = (int) $popular["popular_id"];

            $updatePopularStmt->bind_param(
                "ii",
                $quantity,
                $popularId
            );

            if (!$updatePopularStmt->execute()) {
                throw new Exception(
                    "Failed to update popular flower: " .
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

            $insertPopularStmt = $conn->prepare(
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

            if (!$insertPopularStmt->execute()) {
                throw new Exception(
                    "Failed to register popular flower: " .
                        $insertPopularStmt->error
                );
            }

            $insertPopularStmt->close();
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Everything succeeded
    |--------------------------------------------------------------------------
    */


    /*
     * --------------------------------------------------------------------------
     * | Create order confirmation notification
     * --------------------------------------------------------------------------
     *
     * The notification is stored in the database so it can be retrieved
     * by Notifications.jsx instead of using localStorage.
     */
    $notificationTitle = "Order Confirmed";

    $notificationMessage =
        "Your order #" .
        str_pad((string) $order_id, 4, "0", STR_PAD_LEFT) .
        " has been successfully placed.";

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

    $notificationStmt = $conn->prepare($notificationQuery);

    if (!$notificationStmt) {
        throw new Exception(
            "Failed to prepare notification query: " . $conn->error
        );
    }

    $notificationStmt->bind_param(
        "iiss",
        $client_id,
        $order_id,
        $notificationTitle,
        $notificationMessage
    );

    if (!$notificationStmt->execute()) {
        throw new Exception(
            "Failed to create order notification: " .
                $notificationStmt->error
        );
    }

    $notificationStmt->close();


    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order created successfully.",
        "order_id" => (int) $order_id,
        "client_id" => $client_id,
        "payment_id" => $payment_id,
        "payment_type" => $payment["payment_type"],
        "gcash_last_four" => $payment["gcash_last_four"],
        "order_status" => "pending",
        "unit_price" => $unit_price,
        "items_saved" => $itemsSaved,
        "flowers_updated" => $flowerQuantities
    ]);
} catch (Exception $error) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => $error->getMessage()
    ]);
}

$conn->close();
