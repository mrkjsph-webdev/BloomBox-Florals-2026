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

$clientConn = new mysqli(
    "localhost",
    "root",
    "",
    "bbf_clientdb"
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

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        throw new Exception("Invalid request data.");
    }

    $rider_id = isset($input["rider_id"])
        ? (int) $input["rider_id"]
        : 0;

    if ($rider_id <= 0) {
        throw new Exception(
            "Delivery rider ID is required."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY RIDER
    |--------------------------------------------------------------------------
    */

    $riderStmt = $conn->prepare("
        SELECT
            rider_id,
            name,
            email
        FROM delivery_rider
        WHERE rider_id = ?
        LIMIT 1
    ");

    if (!$riderStmt) {
        throw new Exception(
            "Failed to prepare rider query."
        );
    }

    $riderStmt->bind_param(
        "i",
        $rider_id
    );

    if (!$riderStmt->execute()) {
        throw new Exception(
            "Failed to verify delivery rider."
        );
    }

    $riderResult = $riderStmt->get_result();

    if ($riderResult->num_rows === 0) {
        $riderStmt->close();

        throw new Exception(
            "Delivery rider not found."
        );
    }

    $rider = $riderResult->fetch_assoc();

    $riderStmt->close();


    /*
    |--------------------------------------------------------------------------
    | ACTIVE DELIVERIES
    |--------------------------------------------------------------------------
    |
    | These are the orders currently assigned to this rider.
    |
    */

    $deliverySql = "
        SELECT
            d.delivery_id,
            d.rider_id,
            d.order_id,
            d.delivery_status,
            d.assigned_at,
            d.picked_up_at,
            d.delivered_at,

            o.order_date,
            o.order_status,
            o.delivery_method,
            o.unit_price,

            c.name AS customer_name,
            c.email AS customer_email,
            c.contact_number AS customer_phone,
            c.address AS destination_address,

            COALESCE(
                GROUP_CONCAT(
                    CONCAT(
                        oi.item_name,
                        ' x',
                        oi.quantity
                    )
                    SEPARATOR ', '
                ),
                'No items listed'
            ) AS order_items

        FROM delivery_orders d

        INNER JOIN bbf_clientdb.orders o
            ON o.order_id = d.order_id

        INNER JOIN bbf_clientdb.client c
            ON c.client_id = o.client_id

        LEFT JOIN bbf_clientdb.order_items oi
            ON oi.order_id = o.order_id

        WHERE d.rider_id = ?

        AND d.delivery_status IN (
            'pending',
            'picked_up',
            'in_transit'
        )

        GROUP BY
            d.delivery_id,
            d.rider_id,
            d.order_id,
            d.delivery_status,
            d.assigned_at,
            d.picked_up_at,
            d.delivered_at,
            o.order_date,
            o.order_status,
            o.delivery_method,
            o.unit_price,
            c.name,
            c.email,
            c.contact_number,
            c.address

        ORDER BY
            d.delivery_id ASC
    ";

    $deliveryStmt = $conn->prepare(
        $deliverySql
    );

    if (!$deliveryStmt) {
        throw new Exception(
            "Failed to prepare active deliveries query: "
                . $conn->error
        );
    }

    $deliveryStmt->bind_param(
        "i",
        $rider_id
    );

    if (!$deliveryStmt->execute()) {
        throw new Exception(
            "Failed to retrieve active deliveries."
        );
    }

    $deliveryResult =
        $deliveryStmt->get_result();

    $deliveries = [];

    while ($delivery = $deliveryResult->fetch_assoc()) {

        $orderId =
            (int) $delivery["order_id"];

        $customer =
            !empty($delivery["customer_name"])
            ? $delivery["customer_name"]
            : "Unknown Customer";

        $address =
            !empty($delivery["destination_address"])
            ? $delivery["destination_address"]
            : "Delivery address unavailable";

        $items =
            !empty($delivery["order_items"])
            ? $delivery["order_items"]
            : "No items listed";

        $deliveries[] = [

            /*
            |--------------------------------------------------------------------------
            | IDs
            |--------------------------------------------------------------------------
            */

            "id" =>
            (int) $delivery["delivery_id"],

            "delivery_id" =>
            (int) $delivery["delivery_id"],

            "rider_id" =>
            (int) $delivery["rider_id"],

            "order_id" =>
            $orderId,


            /*
            |--------------------------------------------------------------------------
            | DELIVERY STATUS
            |--------------------------------------------------------------------------
            */

            "delivery_status" =>
            $delivery["delivery_status"],

            "status" =>
            $delivery["delivery_status"],


            /*
            |--------------------------------------------------------------------------
            | CUSTOMER
            |--------------------------------------------------------------------------
            */

            "customer" =>
            $customer,

            "customer_name" =>
            $customer,

            "customer_email" =>
            $delivery["customer_email"] ?? "",

            "customer_phone" =>
            $delivery["customer_phone"] ?? "",

            "phone" =>
            $delivery["customer_phone"] ?? "",


            /*
            |--------------------------------------------------------------------------
            | ADDRESS
            |--------------------------------------------------------------------------
            */

            "address" =>
            $address,

            "destination_address" =>
            $address,

            "pickup_address" =>
            "BloomBox Florals",

            "pickupLocation" => [
                "displayName" =>
                "BloomBox Florals",

                "latitude" =>
                null,

                "longitude" =>
                null
            ],

            "destination" => [
                "displayName" =>
                $address,

                "latitude" =>
                null,

                "longitude" =>
                null
            ],


            /*
            |--------------------------------------------------------------------------
            | ORDER INFORMATION
            |--------------------------------------------------------------------------
            */

            "items" =>
            $items,

            "order_items" =>
            $items,

            "order_date" =>
            $delivery["order_date"],

            "order_status" =>
            $delivery["order_status"],

            "delivery_method" =>
            $delivery["delivery_method"],

            "unit_price" =>
            $delivery["unit_price"],


            /*
            |--------------------------------------------------------------------------
            | DELIVERY TIMES
            |--------------------------------------------------------------------------
            */

            "assigned_at" =>
            $delivery["assigned_at"],

            "picked_up_at" =>
            $delivery["picked_up_at"],

            "delivered_at" =>
            $delivery["delivered_at"]
        ];
    }

    $deliveryStmt->close();


    /*
    |--------------------------------------------------------------------------
    | COMPLETED DELIVERIES
    |--------------------------------------------------------------------------
    */

    $completedSql = "
        SELECT
            d.delivery_id,
            d.rider_id,
            d.order_id,
            d.delivery_status,
            d.assigned_at,
            d.picked_up_at,
            d.delivered_at,

            o.order_date,
            o.order_status,
            o.delivery_method,
            o.unit_price,

            c.name AS customer_name,
            c.email AS customer_email,
            c.contact_number AS customer_phone,
            c.address AS destination_address,

            COALESCE(
                GROUP_CONCAT(
                    CONCAT(
                        oi.item_name,
                        ' x',
                        oi.quantity
                    )
                    SEPARATOR ', '
                ),
                'No items listed'
            ) AS order_items

        FROM delivery_orders d

        INNER JOIN bbf_clientdb.orders o
            ON o.order_id = d.order_id

        INNER JOIN bbf_clientdb.client c
            ON c.client_id = o.client_id

        LEFT JOIN bbf_clientdb.order_items oi
            ON oi.order_id = o.order_id

        WHERE d.rider_id = ?

        AND d.delivery_status = 'delivered'

        AND DATE(d.delivered_at) = CURDATE()

        GROUP BY
            d.delivery_id,
            d.rider_id,
            d.order_id,
            d.delivery_status,
            d.assigned_at,
            d.picked_up_at,
            d.delivered_at,
            o.order_date,
            o.order_status,
            o.delivery_method,
            o.unit_price,
            c.name,
            c.email,
            c.contact_number,
            c.address

        ORDER BY
            d.delivered_at DESC
    ";

    $completedStmt = $conn->prepare(
        $completedSql
    );

    if (!$completedStmt) {
        throw new Exception(
            "Failed to prepare completed deliveries query: "
                . $conn->error
        );
    }

    $completedStmt->bind_param(
        "i",
        $rider_id
    );

    if (!$completedStmt->execute()) {
        throw new Exception(
            "Failed to retrieve completed deliveries."
        );
    }

    $completedResult =
        $completedStmt->get_result();

    $completedDeliveries = [];

    while (
        $delivery =
        $completedResult->fetch_assoc()
    ) {

        $orderId =
            (int) $delivery["order_id"];

        $customer =
            !empty($delivery["customer_name"])
            ? $delivery["customer_name"]
            : "Unknown Customer";

        $address =
            !empty($delivery["destination_address"])
            ? $delivery["destination_address"]
            : "Delivery address unavailable";

        $items =
            !empty($delivery["order_items"])
            ? $delivery["order_items"]
            : "No items listed";

        $completedDeliveries[] = [

            "id" =>
            (int) $delivery["delivery_id"],

            "delivery_id" =>
            (int) $delivery["delivery_id"],

            "rider_id" =>
            (int) $delivery["rider_id"],

            "order_id" =>
            $orderId,

            "delivery_status" =>
            $delivery["delivery_status"],

            "status" =>
            $delivery["delivery_status"],

            "customer" =>
            $customer,

            "customer_name" =>
            $customer,

            "customer_email" =>
            $delivery["customer_email"] ?? "",

            "customer_phone" =>
            $delivery["customer_phone"] ?? "",

            "phone" =>
            $delivery["customer_phone"] ?? "",

            "address" =>
            $address,

            "destination_address" =>
            $address,

            "pickup_address" =>
            "BloomBox Florals",

            "pickupLocation" => [
                "displayName" =>
                "BloomBox Florals",

                "latitude" =>
                null,

                "longitude" =>
                null
            ],

            "destination" => [
                "displayName" =>
                $address,

                "latitude" =>
                null,

                "longitude" =>
                null
            ],

            "items" =>
            $items,

            "order_items" =>
            $items,

            "order_date" =>
            $delivery["order_date"],

            "order_status" =>
            $delivery["order_status"],

            "delivery_method" =>
            $delivery["delivery_method"],

            "unit_price" =>
            $delivery["unit_price"],

            "assigned_at" =>
            $delivery["assigned_at"],

            "picked_up_at" =>
            $delivery["picked_up_at"],

            "delivered_at" =>
            $delivery["delivered_at"]
        ];
    }

    $completedStmt->close();


    /*
    |--------------------------------------------------------------------------
    | STATISTICS
    |--------------------------------------------------------------------------
    */

    $todayDeliveries = 0;
    $yesterdayDeliveries = 0;
    $todayEarnings = 0;
    $completionRate = 0;


    /*
    | Today's completed deliveries
    */

    $statsStmt = $conn->prepare("
        SELECT
            COUNT(*) AS total_completed
        FROM delivery_orders
        WHERE rider_id = ?
        AND delivery_status = 'delivered'
        AND DATE(delivered_at) = CURDATE()
    ");

    if ($statsStmt) {

        $statsStmt->bind_param(
            "i",
            $rider_id
        );

        $statsStmt->execute();

        $statsResult =
            $statsStmt->get_result();

        if ($statsRow =
            $statsResult->fetch_assoc()
        ) {
            $todayDeliveries =
                (int) $statsRow["total_completed"];
        }

        $statsStmt->close();
    }


    /*
    | Yesterday's completed deliveries
    */

    $yesterdayStmt = $conn->prepare("
        SELECT
            COUNT(*) AS total_completed
        FROM delivery_orders
        WHERE rider_id = ?
        AND delivery_status = 'delivered'
        AND DATE(delivered_at) = DATE_SUB(
            CURDATE(),
            INTERVAL 1 DAY
        )
    ");

    if ($yesterdayStmt) {

        $yesterdayStmt->bind_param(
            "i",
            $rider_id
        );

        $yesterdayStmt->execute();

        $yesterdayResult =
            $yesterdayStmt->get_result();

        if (
            $yesterdayRow =
            $yesterdayResult->fetch_assoc()
        ) {
            $yesterdayDeliveries =
                (int) $yesterdayRow["total_completed"];
        }

        $yesterdayStmt->close();
    }


    /*
|--------------------------------------------------------------------------
| Today's earnings
|--------------------------------------------------------------------------
|
*/

    $earningsStmt = $conn->prepare("
    SELECT
        COALESCE(
            SUM(o.unit_price),
            0
        ) AS earnings

    FROM delivery_orders d

    INNER JOIN bbf_clientdb.orders o
        ON o.order_id = d.order_id

    WHERE d.rider_id = ?

    AND d.delivery_status = 'delivered'

    AND DATE(d.delivered_at) = CURDATE()
");

    if ($earningsStmt) {

        $earningsStmt->bind_param(
            "i",
            $rider_id
        );

        $earningsStmt->execute();

        $earningsResult =
            $earningsStmt->get_result();

        if (
            $earningsRow =
            $earningsResult->fetch_assoc()
        ) {
            $todayEarnings =
                (float) $earningsRow["earnings"];
        }

        $earningsStmt->close();
    }


    /*
    | Completion rate
    */

    $completionStmt = $conn->prepare("
        SELECT
            COUNT(*) AS total_deliveries,

            SUM(
                CASE
                    WHEN delivery_status = 'delivered'
                    THEN 1
                    ELSE 0
                END
            ) AS completed_deliveries

        FROM delivery_orders

        WHERE rider_id = ?

        AND DATE(assigned_at) = CURDATE()
    ");

    if ($completionStmt) {

        $completionStmt->bind_param(
            "i",
            $rider_id
        );

        $completionStmt->execute();

        $completionResult =
            $completionStmt->get_result();

        if (
            $completionRow =
            $completionResult->fetch_assoc()
        ) {

            $total =
                (int) $completionRow["total_deliveries"];

            $completed =
                (int) $completionRow["completed_deliveries"];

            if ($total > 0) {
                $completionRate =
                    round(
                        ($completed / $total) * 100,
                        2
                    );
            }
        }

        $completionStmt->close();
    }


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,

        "rider" => [
            "rider_id" =>
            (int) $rider["rider_id"],

            "name" =>
            $rider["name"],

            "email" =>
            $rider["email"]
        ],

        "deliveries" =>
        $deliveries,

        "completed_deliveries" =>
        $completedDeliveries,

        "stats" => [
            "deliveries_today" =>
            $todayDeliveries,

            "deliveries_yesterday" =>
            $yesterdayDeliveries,

            "completion_rate" =>
            $completionRate,

            "today_earnings" =>
            $todayEarnings,

            "bonus" =>
            0
        ]
    ]);
} catch (Exception $error) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
        $error->getMessage()
    ]);
}

$conn->close();
$clientConn->close();
