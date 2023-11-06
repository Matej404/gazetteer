<?php
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["iso_a2"])) {
    $selectedCountry = $_POST["iso_a2"];
    $apiKey = "a8192f90fc404ad1af543d2a6e5e32e3"; 
    $apiUrl = "https://api.opencagedata.com/geocode/v1/json";

    $queryParams = http_build_query([
        "q" => $selectedCountry,
        "key" => $apiKey,
        "limit" => 1
    ]);

    $apiUrl = "{$apiUrl}?{$queryParams}";
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    $geocodingData = json_decode($response, true);

    if ($geocodingData && isset($geocodingData["results"][0])) {
        $latitude = $geocodingData["results"][0]["geometry"]["lat"];
        $longitude = $geocodingData["results"][0]["geometry"]["lng"];

        $responseData = [
            "latitude" => $latitude,
            "longitude" => $longitude,
        ];

        header("Content-Type: application/json");
        echo json_encode($responseData);
    } 
  } 
?>
