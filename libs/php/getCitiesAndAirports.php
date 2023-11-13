<?php
// Function to fetch data from GeoNames API
function fetchGeoNamesData($q, $featureClass) {
    $username = 'matej404'; 
    $url = 'http://api.geonames.org/searchJSON?q=' . urlencode($q) . '&featureClass=' . $featureClass . '&username=' . $username;

    $response = file_get_contents($url);
    return json_decode($response, true);
}

// Selected country ISO code (e.g., 'US' for the United States)
$selectedCountry = $_POST['iso_a2'];

// Create marker cluster groups
$cityMarkers = array();
$airportMarkers = array();

// Fetch data for cities
$cityData = fetchGeoNamesData($selectedCountry, 'P'); // 'P' represents cities
if (!empty($cityData['geonames'])) {
    foreach ($cityData['geonames'] as $city) {
        $cityMarker = array(
            'lat' => $city['lat'],
            'lng' => $city['lng'],
            'name' => $city['name'],
            'countryName' => $city['countryName']
        );

        // Check if the city's country code matches the selected country
        if ($city['countryCode'] === $selectedCountry) {
            array_push($cityMarkers, $cityMarker);
        }
    }
}

// Fetch data for airports
$airportData = fetchGeoNamesData($selectedCountry, 'A'); // 'A' represents airports
if (!empty($airportData['geonames'])) {
    foreach ($airportData['geonames'] as $airport) {
        $airportMarker = array(
            'lat' => $airport['lat'],
            'lng' => $airport['lng'],
            'name' => $airport['name'],
            'countryName' => $airport['countryName']
        );

        // Check if the airport's country code matches the selected country
        if ($airport['countryCode'] === $selectedCountry) {
            array_push($airportMarkers, $airportMarker);
        }
    }
}

// Return JSON response with marker data
$response = array(
    'cityMarkers' => $cityMarkers,
    'airportMarkers' => $airportMarkers
);

header('Content-Type: application/json');
echo json_encode($response);
?>
