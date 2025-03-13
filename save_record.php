<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "admin_acc";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from POST request
$id = $_POST['id'];
$name = $_POST['name'];
$birth = $_POST['birth'];
$death = $_POST['death'];
$section = $_POST['section'];
$plot = $_POST['plot'];
$type = $_POST['type'];

// Debugging: Log received data
error_log("Received data: id=$id, name=$name, birth=$birth, death=$death, section=$section, plot=$plot, type=$type");

if ($id) {
    // Update existing record
    $stmt = $conn->prepare("UPDATE graves SET name=?, birth=?, death=?, section=?, plot=?, type=? WHERE id=?");
    $stmt->bind_param("ssssssi", $name, $birth, $death, $section, $plot, $type, $id);
} else {
    // Add new record
    $stmt = $conn->prepare("INSERT INTO graves (name, birth, death, section, plot, type) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $name, $birth, $death, $section, $plot, $type);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Record successfully saved!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    // Debugging: Log error
    error_log("Error: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>