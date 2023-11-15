<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST["iso_a2"])) {
        $countryCode = $_POST["iso_a2"];
        
        $apiKey = 'pub_312488efc2819ac196f540526569c1f7fc930';
        
        $apiUrl = "https://newsdata.io/api/1/news?apikey=$apiKey&country=$countryCode";
        
        $newsData = file_get_contents($apiUrl);
        
        if ($newsData !== false) {
            $newsData = json_decode($newsData, true); // Decode the JSON response
            
            // Check if 'results' key exists in the decoded data
            if (isset($newsData['results']) && is_array($newsData['results'])) {
                foreach ($newsData['results'] as &$result) {
                    $defaultImagePath = 'assets\news.jpg';
                    $result['image_url'] = $result['image_url'] !== null ? $result['image_url'] : $defaultImagePath;
                }
            }

            echo json_encode($newsData);
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

