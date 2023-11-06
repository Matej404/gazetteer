<?php
header('Content-Type: application/json');

if (isset($_POST['iso_a2'])) {
    $isoCode = $_POST['iso_a2'];

    $geoJsonData = file_get_contents('countryBorders.geo.json');

    $geoJsonArray = json_decode($geoJsonData, true);
    
    foreach ($geoJsonArray['features'] as $feature) {
        if ($feature['properties']['iso_a2'] === $isoCode) {
            echo json_encode($feature);
            exit; 
        }
    }

    echo json_encode([]);
} else {
    
    echo json_encode(['error' => 'ISO code parameter not provided']);
}
?>

