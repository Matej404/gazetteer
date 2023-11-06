<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

// set the return header

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$executionStartTime = microtime(true);

$apiKey = 'pub_312488efc2819ac196f540526569c1f7fc930'; 
$countryCode = $_REQUEST['iso_a2']; 

$url = "https://api.newsdata.io/api/1/news?apikey=$apiKey&country=$countryCode";

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

$cURLERROR = curl_errno($ch);

curl_close($ch);

if ($cURLERROR) {

    $output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
    $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
    $output['data'] = null;

} else {

    // serialise the cURL result to an associative array so that it can be
    // tested for valid content before it is appended to the output array

    $newsData = json_decode($result, true);

    if (json_last_error() !== JSON_ERROR_NONE) {

        $output['status']['code'] = json_last_error();
        $output['status']['name'] = "Failure - JSON";
        $output['status']['description'] = json_last_error_msg();
        $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
        $output['data'] = null;

    } else {

        // has the API returned an error?

        if (isset($newsData['error'])) {

            $output['status']['code'] = $newsData['error']['code'];
            $output['status']['name'] = "Failure - API";
            $output['status']['description'] = $newsData['error']['message'];
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = null;

        } else {

            // create an array containing only the required properties

            $finalResult = [];

            if (isset($newsData['results']) && count($newsData['results']) > 0) {
                foreach ($newsData['results'] as $item) {
                    $temp['image_url'] = $item['image_url'];
                    $temp['link'] = $item['link'];
                    $temp['title'] = $item['title'];
                    array_push($finalResult, $temp);
                }
            }

            $output['status']['code'] = 200;
            $output['status']['name'] = "success";
            $output['status']['description'] = "all ok";
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = $finalResult;
        }
    }
}

echo json_encode($output, JSON_NUMERIC_CHECK);
?>
