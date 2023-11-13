<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST["iso_a2"])) {
        $countryCode = $_POST["iso_a2"];
        
        $apiKey = 'pub_312488efc2819ac196f540526569c1f7fc930';
        
        $apiUrl = "https://newsdata.io/api/1/news?apikey=$apiKey&country=$countryCode";
        
        $newsData = file_get_contents($apiUrl);
        
        if ($newsData !== false) {

            echo $newsData;
        } else {
            echo json_encode(["error" => "Failed to fetch news data."]);
        }
    } else {
        echo json_encode(["error" => "Invalid input data."]);
    }
} else {
    echo json_encode(["error" => "Invalid request method."]);
} 
?>

