<?php
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["lat"]) && isset($_GET["lng"])) {
    $lat = $_GET["lat"];
    $lng = $_GET["lng"];
    $username = "matej404"; 

    $apiUrl = "http://api.geonames.org/countryCodeJSON?";
    $queryParams = http_build_query([
        "lat" => $lat,
        "lng" => $lng,
        "username" => $username
    ]);

    $apiUrl = "{$apiUrl}{$queryParams}";

    $countryCodeData = file_get_contents($apiUrl);

    header("Content-Type: application/json");
    echo $countryCodeData;
} else {
    // Handle invalid or missing parameters
    header("HTTP/1.1 400 Bad Request");
    echo json_encode(["error" => "Invalid or missing parameters"]);
}
?>
