<?php
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["iso_a2"])) {
    $selectedCountry = $_POST["iso_a2"];
    $username = "matej404"; 

    $apiUrl = "http://api.geonames.org/countryInfoJSON";
    $queryParams = http_build_query([
        "formatted" => "true",
        "lang" => "en",
        "country" => $selectedCountry,
        "username" => $username,
        "style" => "full"
    ]);

    $apiUrl = "{$apiUrl}?{$queryParams}";

    // Fetch data from GeoNames API
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    $countryData = json_decode($response, true)["geonames"][0];

    // Prepare data for response
    $responseData = [
        "countryName" => $countryData["countryName"],
        "capital" => $countryData["capital"],
        "continent" => $countryData["continent"],
        "population" => $countryData["population"],
        "currencyCode" => $countryData["currencyCode"],
        // Country Cordinates
        "south" => $countryData["south"],
        "north" => $countryData["north"],
        "east" => $countryData["east"],
        "west" => $countryData["west"]
    ];

    header("Content-Type: application/json");
    echo json_encode($responseData);
  } 
?>
