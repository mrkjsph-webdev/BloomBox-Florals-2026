<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "client_db.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| HELPER FUNCTIONS
|--------------------------------------------------------------------------
*/

function formatOrderStatus($status)
{
    switch ($status) {
        case "pending":
            return "Pending";

        case "out for delivery":
            return "Out for Delivery";

        case "completed":
            return "Delivered";

        case "cancelled":
            return "Cancelled";

        default:
            return $status ?: "Pending";
    }
}

function formatOrderId($orderId)
{
    return "#BB-" . str_pad((int) $orderId, 4, "0", STR_PAD_LEFT);
}

function formatOrderDate($date)
{
    if (!$date) {
        return "";
    }

    $timestamp = strtotime($date);

    if ($timestamp === false) {
        return $date;
    }

    return date("M j, Y", $timestamp);
}

function formatCurrency($amount)
{
    return "₱" . number_format((float) $amount, 2);
}


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

$users = [];

$usersQuery = "
    SELECT
        c.client_id,
        c.name,
        c.email,
        c.contact_number,
        c.created_at,
        COUNT(o.order_id) AS orders
    FROM Client c
    LEFT JOIN orders o
        ON c.client_id = o.client_id
    GROUP BY
        c.client_id,
        c.name,
        c.email,
        c.contact_number,
        c.created_at
    ORDER BY c.created_at DESC
";

$usersResult = $conn->query($usersQuery);

if ($usersResult) {

    while ($row = $usersResult->fetch_assoc()) {

        $contactNumber = $row["contact_number"] ?? "";

        $users[] = [
            "client_id" => (int) $row["client_id"],
            "name" => $row["name"] ?? "",
            "email" => $row["email"] ?? "",
            "contact_number" => $contactNumber,
            "phone" => $contactNumber,
            "orders" => (int) ($row["orders"] ?? 0),
            "created_at" => $row["created_at"] ?? "",
            "joined" => formatOrderDate($row["created_at"] ?? "")
        ];
    }

    $usersResult->free();
}


/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

$orders = [];

$ordersQuery = "
    SELECT
        o.order_id,
        o.client_id,
        o.order_date,
        o.order_status,
        o.unit_price,
        c.name AS customer_name
    FROM orders o
    LEFT JOIN Client c
        ON o.client_id = c.client_id
    ORDER BY
        o.order_date DESC,
        o.order_id DESC
";

$ordersResult = $conn->query($ordersQuery);

if ($ordersResult) {

    while ($row = $ordersResult->fetch_assoc()) {

        $orderId = (int) $row["order_id"];

        $status = strtolower(
            trim($row["order_status"] ?? "")
        );

        $unitPrice = (float) ($row["unit_price"] ?? 0);

        $displayStatus = formatOrderStatus($status);

        $orders[] = [
            "id" => formatOrderId($orderId),

            "order_id" => $orderId,

            "customer" =>
            $row["customer_name"] ??
                "Unknown Customer",

            "bouquet" => "BloomBox Bouquet",

            "order_date" =>
            $row["order_date"] ?? "",

            "date" =>
            formatOrderDate(
                $row["order_date"] ?? ""
            ),

            "unit_price" => $unitPrice,

            "total" =>
            formatCurrency($unitPrice),

            "status" => $displayStatus,

            "order_status" => $status,

            "raw_status" => $status
        ];
    }

    $ordersResult->free();
}


/*
|--------------------------------------------------------------------------
| INVENTORY
|--------------------------------------------------------------------------
*/

$inventory = [];

$inventoryQuery = "
    SELECT
        flower_id,
        flower_name,
        flower_image,
        flower_description,
        stock
    FROM bbf_inventorydb.flower_inventory
    ORDER BY flower_name ASC
";

$inventoryResult = $conn->query($inventoryQuery);

if ($inventoryResult) {

    while ($row = $inventoryResult->fetch_assoc()) {

        $stock = (int) ($row["stock"] ?? 0);

        $inventory[] = [
            "flower_id" => (int) $row["flower_id"],

            "flower_name" =>
            $row["flower_name"] ?? "",

            "name" =>
            $row["flower_name"] ?? "",

            "category" => "Flower",

            "stock" => $stock,

            "price" => null,

            "flower_image" =>
            $row["flower_image"] ?? "",

            "flower_description" =>
            $row["flower_description"] ?? ""
        ];
    }

    $inventoryResult->free();
}


/*
|--------------------------------------------------------------------------
| POPULAR FLOWERS
|--------------------------------------------------------------------------
*/

$popularFlowers = [];

$popularQuery = "
    SELECT
        pf.popular_id,
        pf.flower_id,
        pf.amount_sold,
        fi.flower_name
    FROM bbf_inventorydb.popular_flowers pf
    INNER JOIN bbf_inventorydb.flower_inventory fi
        ON pf.flower_id = fi.flower_id
    ORDER BY
        pf.amount_sold DESC,
        fi.flower_name ASC
";

$popularResult = $conn->query($popularQuery);

if ($popularResult) {

    while ($row = $popularResult->fetch_assoc()) {

        $flowerName =
            $row["flower_name"] ?? "";

        $popularFlowers[] = [
            "popular_id" =>
            (int) $row["popular_id"],

            "flower_id" =>
            (int) $row["flower_id"],

            "name" =>
            $flowerName,

            "flower_name" =>
            $flowerName,

            "amount_sold" =>
            (int) ($row["amount_sold"] ?? 0)
        ];
    }

    $popularResult->free();
}


/*
|--------------------------------------------------------------------------
| LOW STOCK
|--------------------------------------------------------------------------
|
| Flowers with 10 or fewer items are considered low stock.
|
*/

$lowStock = [];

foreach ($inventory as $flower) {

    if ((int) $flower["stock"] <= 10) {
        $lowStock[] = $flower;
    }
}


/*
|--------------------------------------------------------------------------
| RECENT ORDERS
|--------------------------------------------------------------------------
*/

$recentOrders = array_slice($orders, 0, 5);


/*
|--------------------------------------------------------------------------
| RIDERS
|--------------------------------------------------------------------------
|
| No delivery rider table/schema has been provided yet,
| so this remains an empty array rather than creating
| fake rider records.
|
*/

$riders = [];


/*
|--------------------------------------------------------------------------
| ORDER STATISTICS
|--------------------------------------------------------------------------
|
| IMPORTANT:
| The orders table uses these exact statuses:
|
| pending
| out for delivery
| completed
| cancelled
|
*/

$statsQuery = "
    SELECT
        COUNT(*) AS total,

        SUM(
            CASE
                WHEN order_status = 'pending'
                THEN 1
                ELSE 0
            END
        ) AS pending,

        SUM(
            CASE
                WHEN order_status = 'out for delivery'
                THEN 1
                ELSE 0
            END
        ) AS out_for_delivery,

        SUM(
            CASE
                WHEN order_status = 'completed'
                THEN 1
                ELSE 0
            END
        ) AS completed,

        SUM(
            CASE
                WHEN order_status = 'cancelled'
                THEN 1
                ELSE 0
            END
        ) AS cancelled,

        COALESCE(
            SUM(
                CASE
                    WHEN order_status != 'cancelled'
                    THEN unit_price
                    ELSE 0
                END
            ),
            0
        ) AS revenue

    FROM orders
";

$statsResult = $conn->query($statsQuery);

if ($statsResult) {

    $statsRow = $statsResult->fetch_assoc();

    $statsResult->free();
} else {

    $statsRow = [
        "total" => 0,
        "pending" => 0,
        "out_for_delivery" => 0,
        "completed" => 0,
        "cancelled" => 0,
        "revenue" => 0
    ];
}


/*
|--------------------------------------------------------------------------
| STATS
|--------------------------------------------------------------------------
*/

$stats = [
    "total" =>
    (int) ($statsRow["total"] ?? 0),

    "total_orders" =>
    (int) ($statsRow["total"] ?? 0),

    "pending" =>
    (int) ($statsRow["pending"] ?? 0),

    "out_for_delivery" =>
    (int) ($statsRow["out_for_delivery"] ?? 0),

    "completed" =>
    (int) ($statsRow["completed"] ?? 0),

    "cancelled" =>
    (int) ($statsRow["cancelled"] ?? 0),

    "revenue" =>
    (float) ($statsRow["revenue"] ?? 0),

    "total_revenue" =>
    (float) ($statsRow["revenue"] ?? 0),

    /*
     * Keep these older fields for compatibility
     * with any existing React code.
     */
    "processing" =>
    (int) ($statsRow["out_for_delivery"] ?? 0),

    "in_delivery" =>
    (int) ($statsRow["out_for_delivery"] ?? 0),

    "ready_for_pickup" => 0
];


/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

$response = [
    "success" => true,

    "users" => $users,

    "orders" => $orders,

    "inventory" => $inventory,

    "popular" => $popularFlowers,

    "popular_flowers" => $popularFlowers,

    "low_stock" => $lowStock,

    "recent_orders" => $recentOrders,

    "riders" => $riders,

    "stats" => $stats
];


/*
|--------------------------------------------------------------------------
| CLOSE CONNECTION
|--------------------------------------------------------------------------
*/

$conn->close();


/*
|--------------------------------------------------------------------------
| SEND JSON
|--------------------------------------------------------------------------
*/

echo json_encode(
    $response,
    JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
);
