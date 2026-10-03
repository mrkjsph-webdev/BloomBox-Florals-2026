<?php

header("Content-Type: application/json");
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

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON request."
    ]);
    exit;
}

$action = $data["action"] ?? "";
$client_id = isset($data["client_id"])
    ? (int) $data["client_id"]
    : 0;

if ($client_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid client ID."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| GET PAYMENT METHODS
|--------------------------------------------------------------------------
*/

if ($action === "get") {

    $stmt = $conn->prepare("
        SELECT
            payment_id,
            payment_type,
            gcash_last_four,
            is_default,
            created_at
        FROM payment_methods
        WHERE client_id = ?
        ORDER BY is_default DESC, payment_id DESC
    ");

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to prepare payment method query."
        ]);
        exit;
    }

    $stmt->bind_param("i", $client_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $payment_methods = [];

    while ($row = $result->fetch_assoc()) {
        $payment_methods[] = [
            "payment_id" => (int) $row["payment_id"],
            "payment_type" => $row["payment_type"],
            "gcash_last_four" => $row["gcash_last_four"],
            "is_default" => (int) $row["is_default"],
            "created_at" => $row["created_at"]
        ];
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "payment_methods" => $payment_methods
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| ADD PAYMENT METHOD
|--------------------------------------------------------------------------
*/

if ($action === "add") {

    $payment_type = strtolower(
        trim($data["payment_type"] ?? "")
    );

    if (!in_array($payment_type, ["cash", "gcash"], true)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid payment type."
        ]);
        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | CASH
    |--------------------------------------------------------------------------
    */

    if ($payment_type === "cash") {

        // Check if the client already has Cash saved.
        $check_stmt = $conn->prepare("
            SELECT payment_id
            FROM payment_methods
            WHERE client_id = ?
            AND payment_type = 'cash'
            LIMIT 1
        ");

        $check_stmt->bind_param("i", $client_id);
        $check_stmt->execute();

        $check_result = $check_stmt->get_result();

        if ($check_result->num_rows > 0) {
            $check_stmt->close();

            echo json_encode([
                "success" => false,
                "message" => "Cash is already saved as a payment method."
            ]);
            exit;
        }

        $check_stmt->close();

        /*
        |--------------------------------------------------------------------------
        | Determine whether this should be the default payment method.
        |--------------------------------------------------------------------------
        */

        $count_stmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM payment_methods
            WHERE client_id = ?
        ");

        $count_stmt->bind_param("i", $client_id);
        $count_stmt->execute();

        $count_result = $count_stmt->get_result();
        $count_row = $count_result->fetch_assoc();

        $is_default = ((int) $count_row["total"] === 0) ? 1 : 0;

        $count_stmt->close();

        $stmt = $conn->prepare("
            INSERT INTO payment_methods
            (
                client_id,
                payment_type,
                gcash_last_four,
                is_default
            )
            VALUES (?, 'cash', NULL, ?)
        ");

        if (!$stmt) {
            echo json_encode([
                "success" => false,
                "message" => "Failed to prepare cash payment method."
            ]);
            exit;
        }

        $stmt->bind_param(
            "ii",
            $client_id,
            $is_default
        );

        if (!$stmt->execute()) {
            $stmt->close();

            echo json_encode([
                "success" => false,
                "message" => "Failed to add cash payment method."
            ]);
            exit;
        }

        $payment_id = $stmt->insert_id;

        $stmt->close();

        echo json_encode([
            "success" => true,
            "message" => "Cash payment method added successfully.",
            "payment_id" => $payment_id
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | GCASH
    |--------------------------------------------------------------------------
    */

    if ($payment_type === "gcash") {

        $gcash_number = trim(
            $data["gcash_number"] ?? ""
        );

        // Remove spaces, dashes, parentheses, etc.
        $gcash_number = preg_replace(
            "/[^0-9]/",
            "",
            $gcash_number
        );

        if (strlen($gcash_number) !== 11) {
            echo json_encode([
                "success" => false,
                "message" => "Please enter a valid 11-digit GCash mobile number."
            ]);
            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | Make sure it starts with 09.
        |--------------------------------------------------------------------------
        */

        if (substr($gcash_number, 0, 2) !== "09") {
            echo json_encode([
                "success" => false,
                "message" => "Please enter a valid Philippine mobile number."
            ]);
            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | Only store the last 4 digits.
        |--------------------------------------------------------------------------
        */

        $gcash_last_four = substr(
            $gcash_number,
            -4
        );

        /*
        |--------------------------------------------------------------------------
        | Check if the same GCash account is already saved.
        |--------------------------------------------------------------------------
        */

        $check_stmt = $conn->prepare("
            SELECT payment_id
            FROM payment_methods
            WHERE client_id = ?
            AND payment_type = 'gcash'
            AND gcash_last_four = ?
            LIMIT 1
        ");

        $check_stmt->bind_param(
            "is",
            $client_id,
            $gcash_last_four
        );

        $check_stmt->execute();

        $check_result = $check_stmt->get_result();

        if ($check_result->num_rows > 0) {
            $check_stmt->close();

            echo json_encode([
                "success" => false,
                "message" => "This GCash payment method is already saved."
            ]);
            exit;
        }

        $check_stmt->close();

        /*
        |--------------------------------------------------------------------------
        | Determine whether this should be the default payment method.
        |--------------------------------------------------------------------------
        */

        $count_stmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM payment_methods
            WHERE client_id = ?
        ");

        $count_stmt->bind_param(
            "i",
            $client_id
        );

        $count_stmt->execute();

        $count_result = $count_stmt->get_result();
        $count_row = $count_result->fetch_assoc();

        $is_default = ((int) $count_row["total"] === 0) ? 1 : 0;

        $count_stmt->close();

        /*
        |--------------------------------------------------------------------------
        | Insert GCash payment method.
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            INSERT INTO payment_methods
            (
                client_id,
                payment_type,
                gcash_last_four,
                is_default
            )
            VALUES (?, 'gcash', ?, ?)
        ");

        if (!$stmt) {
            echo json_encode([
                "success" => false,
                "message" => "Failed to prepare GCash payment method."
            ]);
            exit;
        }

        $stmt->bind_param(
            "isi",
            $client_id,
            $gcash_last_four,
            $is_default
        );

        if (!$stmt->execute()) {
            $stmt->close();

            echo json_encode([
                "success" => false,
                "message" => "Failed to add GCash payment method."
            ]);
            exit;
        }

        $payment_id = $stmt->insert_id;

        $stmt->close();

        echo json_encode([
            "success" => true,
            "message" => "GCash payment method added successfully.",
            "payment_id" => $payment_id
        ]);

        exit;
    }
}

/*
|--------------------------------------------------------------------------
| REMOVE PAYMENT METHOD
|--------------------------------------------------------------------------
*/

if ($action === "remove") {

    $payment_id = isset($data["payment_id"])
        ? (int) $data["payment_id"]
        : 0;

    if ($payment_id <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid payment method ID."
        ]);
        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Get the payment method first so we know if it was the default.
    |--------------------------------------------------------------------------
    */

    $check_stmt = $conn->prepare("
        SELECT
            payment_id,
            is_default
        FROM payment_methods
        WHERE payment_id = ?
        AND client_id = ?
        LIMIT 1
    ");

    if (!$check_stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to check payment method."
        ]);
        exit;
    }

    $check_stmt->bind_param(
        "ii",
        $payment_id,
        $client_id
    );

    $check_stmt->execute();

    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows === 0) {
        $check_stmt->close();

        echo json_encode([
            "success" => false,
            "message" => "Payment method not found."
        ]);
        exit;
    }

    $payment = $check_result->fetch_assoc();

    $was_default = (int) $payment["is_default"] === 1;

    $check_stmt->close();

    /*
    |--------------------------------------------------------------------------
    | Delete payment method.
    |--------------------------------------------------------------------------
    */

    $delete_stmt = $conn->prepare("
        DELETE FROM payment_methods
        WHERE payment_id = ?
        AND client_id = ?
    ");

    if (!$delete_stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to prepare payment method removal."
        ]);
        exit;
    }

    $delete_stmt->bind_param(
        "ii",
        $payment_id,
        $client_id
    );

    if (!$delete_stmt->execute()) {
        $delete_stmt->close();

        echo json_encode([
            "success" => false,
            "message" => "Failed to remove payment method."
        ]);
        exit;
    }

    $delete_stmt->close();

    /*
    |--------------------------------------------------------------------------
    | If the removed method was the default,
    | make the newest remaining method the default.
    |--------------------------------------------------------------------------
    */

    if ($was_default) {

        $new_default_stmt = $conn->prepare("
            SELECT payment_id
            FROM payment_methods
            WHERE client_id = ?
            ORDER BY payment_id DESC
            LIMIT 1
        ");

        $new_default_stmt->bind_param(
            "i",
            $client_id
        );

        $new_default_stmt->execute();

        $new_default_result =
            $new_default_stmt->get_result();

        if ($new_default_result->num_rows > 0) {

            $new_default =
                $new_default_result->fetch_assoc();

            $new_default_id =
                (int) $new_default["payment_id"];

            $new_default_stmt->close();

            $update_default_stmt = $conn->prepare("
                UPDATE payment_methods
                SET is_default = 1
                WHERE payment_id = ?
                AND client_id = ?
            ");

            $update_default_stmt->bind_param(
                "ii",
                $new_default_id,
                $client_id
            );

            $update_default_stmt->execute();
            $update_default_stmt->close();
        } else {
            $new_default_stmt->close();
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Payment method removed successfully."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| INVALID ACTION
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => false,
    "message" => "Invalid action."
]);

$conn->close();

?>