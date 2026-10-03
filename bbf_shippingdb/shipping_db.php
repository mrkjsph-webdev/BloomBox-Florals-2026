<?php

$host = "localhost";
$username = "root";
$password = "";
$database = "bbf_shippingdb";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Shipping database connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>