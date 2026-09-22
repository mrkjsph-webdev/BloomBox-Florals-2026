<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "inventory_db.php";

$flower_id = $_GET["flower_id"] ?? "";

if ($flower_id === "") {
    echo json_encode([
        "success" => false,
        "message" => "Flower ID is required."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT flower_id, flower_name, flower_image, flower_description, stock, flower_rating
     FROM flower_inventory
     WHERE flower_id = ?"
);

$stmt->bind_param("i", $flower_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Flower not found."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$flower = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "flower" => $flower
]);

$stmt->close();
$conn->close();

?>