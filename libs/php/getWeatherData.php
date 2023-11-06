<?php
  if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["lat"]) && isset($_GET["lon"])) {
    $lat = $_GET["lat"];
    $lon = $_GET["lon"];
    $apiKey = "1ee878ec218612b0810b29f048711764"; 
    
    $apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}";

    // Fetch weather data from OpenWeatherMap API
    $weatherData = file_get_contents($apiUrl);

    // Return weather data as JSON
    header("Content-Type: application/json");
    echo $weatherData;
}
?>

