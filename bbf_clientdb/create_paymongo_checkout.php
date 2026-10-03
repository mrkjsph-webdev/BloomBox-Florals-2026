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
require_once "paymongo_config.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if (!is_array($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON received."
    ]);
    exit;
}

$action = $data["action"] ?? "create";

$order_id = isset($data["order_id"])
    ? (int) $data["order_id"]
    : 0;

$client_id = isset($data["client_id"])
    ? (int) $data["client_id"]
    : 0;

if ($order_id <= 0 || $client_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid order_id or client_id."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| STATUS CHECK
|--------------------------------------------------------------------------
*/

if ($action === "status") {

    $paymentIntentId = trim(
        (string) (
            $data["payment_intent_id"] ?? ""
        )
    );

    $statusQuery = "
        SELECT
            order_id,
            client_id,
            payment_status,
            paymongo_payment_intent_id,
            paymongo_payment_id
        FROM orders
        WHERE order_id = ?
          AND client_id = ?
        LIMIT 1
    ";

    $statusStmt = $conn->prepare($statusQuery);

    if (!$statusStmt) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to prepare payment status query.",
            "error" => $conn->error
        ]);
        exit;
    }

    $statusStmt->bind_param(
        "ii",
        $order_id,
        $client_id
    );

    if (!$statusStmt->execute()) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to check payment status.",
            "error" => $statusStmt->error
        ]);
        exit;
    }

    $statusResult = $statusStmt->get_result();

    if ($statusResult->num_rows === 0) {
        $statusStmt->close();

        echo json_encode([
            "success" => false,
            "message" => "Order not found."
        ]);
        exit;
    }

    $order = $statusResult->fetch_assoc();

    $statusStmt->close();

    if (
        $paymentIntentId !== "" &&
        !empty($order["paymongo_payment_intent_id"]) &&
        $paymentIntentId !== $order["paymongo_payment_intent_id"]
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Payment Intent does not belong to this order."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "order_id" => $order_id,
        "payment_status" =>
        $order["payment_status"] ?? "pending",
        "payment_intent_id" =>
        $order["paymongo_payment_intent_id"] ?? null,
        "payment_id" =>
        $order["paymongo_payment_id"] ?? null
    ]);

    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| CREATE QR PH PAYMENT
|--------------------------------------------------------------------------
*/

if ($action !== "create") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid action."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Get order
|--------------------------------------------------------------------------
*/

$orderQuery = "
    SELECT
        order_id,
        client_id,
        unit_price,
        payment_id,
        payment_status,
        paymongo_payment_intent_id,
        paymongo_qr_code_url,
        paymongo_qr_expires_at
    FROM orders
    WHERE order_id = ?
      AND client_id = ?
    LIMIT 1
";

$orderStmt = $conn->prepare($orderQuery);

if (!$orderStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare order query.",
        "error" => $conn->error
    ]);
    exit;
}

$orderStmt->bind_param(
    "ii",
    $order_id,
    $client_id
);

if (!$orderStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to get order.",
        "error" => $orderStmt->error
    ]);
    exit;
}

$orderResult = $orderStmt->get_result();

if ($orderResult->num_rows === 0) {
    $orderStmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Order not found."
    ]);
    exit;
}

$order = $orderResult->fetch_assoc();

$orderStmt->close();


/*
|--------------------------------------------------------------------------
| Verify payment method
|--------------------------------------------------------------------------
*/

$paymentQuery = "
    SELECT
        payment_type
    FROM payment_methods
    WHERE payment_id = ?
      AND client_id = ?
    LIMIT 1
";

$paymentStmt = $conn->prepare($paymentQuery);

if (!$paymentStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare payment method query.",
        "error" => $conn->error
    ]);
    exit;
}

$paymentStmt->bind_param(
    "ii",
    $order["payment_id"],
    $client_id
);

if (!$paymentStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to verify payment method.",
        "error" => $paymentStmt->error
    ]);
    exit;
}

$paymentResult = $paymentStmt->get_result();

if ($paymentResult->num_rows === 0) {
    $paymentStmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Payment method not found."
    ]);
    exit;
}

$payment = $paymentResult->fetch_assoc();

$paymentStmt->close();

if ($payment["payment_type"] !== "gcash") {
    echo json_encode([
        "success" => false,
        "message" => "Only GCash payments can use PayMongo QR Ph."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Already paid
|--------------------------------------------------------------------------
*/

if (($order["payment_status"] ?? "") === "paid") {
    echo json_encode([
        "success" => false,
        "message" => "This order has already been paid."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| RETURN EXISTING QR IF IT IS STILL VALID
|--------------------------------------------------------------------------
|
| This is what allows OrderDetails / Checkout to reuse the
| same QR instead of creating another Payment Intent.
|--------------------------------------------------------------------------
*/

if (
    !empty($order["paymongo_payment_intent_id"]) &&
    !empty($order["paymongo_qr_code_url"]) &&
    !empty($order["paymongo_qr_expires_at"])
) {

    $expiryTimestamp = strtotime(
        $order["paymongo_qr_expires_at"]
    );

    if (
        $expiryTimestamp !== false &&
        $expiryTimestamp > time()
    ) {

        echo json_encode([
            "success" => true,
            "message" => "Existing PayMongo QR Ph payment returned.",
            "order_id" => $order_id,
            "payment_intent_id" =>
            $order["paymongo_payment_intent_id"],
            "qr_code" =>
            $order["paymongo_qr_code_url"],
            "expires_at" =>
            $expiryTimestamp,
            "existing_payment" => true
        ]);

        $conn->close();

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Convert PHP pesos to centavos
|--------------------------------------------------------------------------
*/

$amount = (int) round(
    ((float) $order["unit_price"]) * 100
);

if ($amount < 100) {
    echo json_encode([
        "success" => false,
        "message" =>
        "The PayMongo QR Ph amount must be at least ₱1.00."
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Create Payment Intent
|--------------------------------------------------------------------------
*/

$orderReference =
    "BB-" .
    str_pad(
        (string) $order_id,
        4,
        "0",
        STR_PAD_LEFT
    );

$intentBody = [
    "data" => [
        "attributes" => [
            "amount" => $amount,
            "currency" => "PHP",
            "payment_method_allowed" => [
                "qrph"
            ],
            "description" =>
            "BloomBox Florals Order #" .
                $order_id,
            "metadata" => [
                "order_id" =>
                (string) $order_id,
                "client_id" =>
                (string) $client_id,
                "reference_number" =>
                $orderReference
            ]
        ]
    ]
];

$ch = curl_init(
    PAYMONGO_API_URL .
        "/payment_intents"
);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json",
        "Authorization: Basic " .
            base64_encode(
                PAYMONGO_SECRET_KEY . ":"
            )
    ],
    CURLOPT_POSTFIELDS =>
    json_encode($intentBody),
    CURLOPT_TIMEOUT => 30
]);

$intentResponse = curl_exec($ch);

$intentCurlError = curl_error($ch);

$intentHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

if (
    $intentResponse === false ||
    $intentCurlError !== ""
) {
    echo json_encode([
        "success" => false,
        "message" =>
        "Unable to connect to PayMongo while creating the Payment Intent.",
        "error" => $intentCurlError
    ]);
    exit;
}

$intentData = json_decode(
    $intentResponse,
    true
);

if (
    $intentHttpCode < 200 ||
    $intentHttpCode >= 300
) {
    echo json_encode([
        "success" => false,
        "message" =>
        "PayMongo rejected the Payment Intent.",
        "http_code" =>
        $intentHttpCode,
        "paymongo_error" =>
        $intentData
    ]);
    exit;
}

$paymentIntent =
    $intentData["data"] ?? null;

if (!is_array($paymentIntent)) {
    echo json_encode([
        "success" => false,
        "message" =>
        "Invalid Payment Intent response from PayMongo.",
        "response" =>
        $intentData
    ]);
    exit;
}

$paymentIntentId =
    $paymentIntent["id"] ?? null;

$clientKey =
    $paymentIntent["attributes"]["client_key"]
    ?? null;

if (!$paymentIntentId || !$clientKey) {
    echo json_encode([
        "success" => false,
        "message" =>
        "PayMongo did not return a valid Payment Intent.",
        "response" =>
        $intentData
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Create QR Ph Payment Method
|--------------------------------------------------------------------------
*/

$paymentMethodBody = [
    "data" => [
        "attributes" => [
            "type" => "qrph",
            "expiry_seconds" => 1800
        ]
    ]
];

$ch = curl_init(
    PAYMONGO_API_URL .
        "/payment_methods"
);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json",
        "Authorization: Basic " .
            base64_encode(
                PAYMONGO_SECRET_KEY . ":"
            )
    ],
    CURLOPT_POSTFIELDS =>
    json_encode($paymentMethodBody),
    CURLOPT_TIMEOUT => 30
]);

$paymentMethodResponse = curl_exec($ch);

$paymentMethodCurlError = curl_error($ch);

$paymentMethodHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

if (
    $paymentMethodResponse === false ||
    $paymentMethodCurlError !== ""
) {
    echo json_encode([
        "success" => false,
        "message" =>
        "Unable to create the PayMongo QR Ph Payment Method.",
        "error" =>
        $paymentMethodCurlError
    ]);
    exit;
}

$paymentMethodData = json_decode(
    $paymentMethodResponse,
    true
);

if (
    $paymentMethodHttpCode < 200 ||
    $paymentMethodHttpCode >= 300
) {
    echo json_encode([
        "success" => false,
        "message" =>
        "PayMongo rejected the QR Ph Payment Method.",
        "http_code" =>
        $paymentMethodHttpCode,
        "paymongo_error" =>
        $paymentMethodData
    ]);
    exit;
}

$paymentMethodResource =
    $paymentMethodData["data"] ?? null;

if (!is_array($paymentMethodResource)) {
    echo json_encode([
        "success" => false,
        "message" =>
        "Invalid QR Ph Payment Method response.",
        "response" =>
        $paymentMethodData
    ]);
    exit;
}

$paymentMethodId =
    $paymentMethodResource["id"] ?? null;

if (!$paymentMethodId) {
    echo json_encode([
        "success" => false,
        "message" =>
        "PayMongo did not return a QR Ph Payment Method ID.",
        "response" =>
        $paymentMethodData
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Attach QR Ph Payment Method
|--------------------------------------------------------------------------
*/

$attachBody = [
    "data" => [
        "attributes" => [
            "payment_method" =>
            $paymentMethodId,
            "client_key" =>
            $clientKey
        ]
    ]
];

$ch = curl_init(
    PAYMONGO_API_URL .
        "/payment_intents/" .
        urlencode($paymentIntentId) .
        "/attach"
);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json",
        "Authorization: Basic " .
            base64_encode(
                PAYMONGO_SECRET_KEY . ":"
            )
    ],
    CURLOPT_POSTFIELDS =>
    json_encode($attachBody),
    CURLOPT_TIMEOUT => 30
]);

$attachResponse = curl_exec($ch);

$attachCurlError = curl_error($ch);

$attachHttpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

if (
    $attachResponse === false ||
    $attachCurlError !== ""
) {
    echo json_encode([
        "success" => false,
        "message" =>
        "Unable to attach the QR Ph payment method.",
        "error" =>
        $attachCurlError
    ]);
    exit;
}

$attachData = json_decode(
    $attachResponse,
    true
);

if (
    $attachHttpCode < 200 ||
    $attachHttpCode >= 300
) {
    echo json_encode([
        "success" => false,
        "message" =>
        "PayMongo rejected the QR Ph payment attachment.",
        "http_code" =>
        $attachHttpCode,
        "paymongo_error" =>
        $attachData
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Get QR image
|--------------------------------------------------------------------------
*/

$attachedIntent =
    $attachData["data"] ?? null;

if (!is_array($attachedIntent)) {
    echo json_encode([
        "success" => false,
        "message" =>
        "Invalid Payment Intent attachment response.",
        "response" =>
        $attachData
    ]);
    exit;
}

$attachedAttributes =
    $attachedIntent["attributes"] ?? [];

$qrImage =
    $attachedAttributes["next_action"]["code"]["image_url"]
    ?? null;

$paymentIntentStatus =
    $attachedAttributes["status"]
    ?? null;

if (!$qrImage) {
    echo json_encode([
        "success" => false,
        "message" =>
        "PayMongo did not return a QR Ph image.",
        "payment_intent_status" =>
        $paymentIntentStatus,
        "response" =>
        $attachData
    ]);
    exit;
}


/*
|--------------------------------------------------------------------------
| Save Payment Intent + QR
|--------------------------------------------------------------------------
*/

$expiresAtTimestamp = time() + 1800;

$expiresAtSql = date(
    "Y-m-d H:i:s",
    $expiresAtTimestamp
);

$updateQuery = "
    UPDATE orders
    SET
        paymongo_payment_intent_id = ?,
        paymongo_qr_code_url = ?,
        paymongo_qr_expires_at = ?
    WHERE order_id = ?
      AND client_id = ?
";

$updateStmt = $conn->prepare($updateQuery);

if (!$updateStmt) {
    echo json_encode([
        "success" => false,
        "message" =>
        "QR was created, but the PayMongo payment could not be saved.",
        "error" =>
        $conn->error
    ]);
    exit;
}

$updateStmt->bind_param(
    "sssii",
    $paymentIntentId,
    $qrImage,
    $expiresAtSql,
    $order_id,
    $client_id
);

if (!$updateStmt->execute()) {
    $updateStmt->close();

    echo json_encode([
        "success" => false,
        "message" =>
        "QR was created, but the PayMongo payment could not be saved.",
        "error" =>
        $updateStmt->error
    ]);
    exit;
}

$updateStmt->close();


/*
|--------------------------------------------------------------------------
| Return QR to React
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" =>
    "PayMongo QR Ph payment created successfully.",
    "order_id" =>
    $order_id,
    "payment_intent_id" =>
    $paymentIntentId,
    "payment_intent_status" =>
    $paymentIntentStatus,
    "qr_code" =>
    $qrImage,
    "expires_at" =>
    $expiresAtTimestamp,
    "existing_payment" =>
    false
]);

$conn->close();
