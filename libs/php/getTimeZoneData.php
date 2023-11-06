<?php
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["lat"]) && isset($_GET["lng"])) {
    $lat = $_GET["lat"];
    $lng = $_GET["lng"];
    $username = "matej404"; 

    $apiUrl = "http://api.geonames.org/timezoneJSON";
    $queryParams = http_build_query([
        "lat" => $lat,
        "lng" => $lng,
        "username" => $username
    ]);

    $apiUrl = "{$apiUrl}?{$queryParams}";

    $timeZoneData = file_get_contents($apiUrl);

    header("Content-Type: application/json");
    echo $timeZoneData;
}
?>
