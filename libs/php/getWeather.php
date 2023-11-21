<?php
/*
	// https://api.weatherapi.com/v1/forecast.json?q=London&key=41663ae9d22a4b1ba10160256221312&days=4&aqi=no

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	// set the return header

	header('Content-Type: application/json; charset=UTF-8');
  header('Access-Control-Allow-Origin: *');	

	$executionStartTime = microtime(true);

	$url='https://api.weatherapi.com/v1/forecast.json?q=' . $_REQUEST['location'] . '&key=440f437aae3984ab592f114410231711&days=5&aqi=no';

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

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

    $weather = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
		  $output['data'] = null;

    } else {

      if (isset($weather['error'])) {

        $output['status']['code'] = $weather['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $weather['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  $output['data'] = null;

      } else {


        $finalResult['country'] = $weather['location']['country'];
        $finalResult['location'] = $weather['location']['name'];

        $finalResult['lastUpdated'] = $weather['current']['last_updated'];

        $finalResult['forecast'] = [];

        foreach ($weather['forecast']['forecastday'] as $item) {

          $temp['date'] = $item['date'];

          $temp['minC'] = intval($item['day']['mintemp_c']);
          $temp['maxC'] = intval($item['day']['maxtemp_c']);

          $temp['conditionText'] = $item['day']['condition']['text'];
          $temp['conditionIcon'] = 'https:' . $item['day']['condition']['icon'];

          array_push($finalResult['forecast'], $temp);          

        }

        $output['status']['code'] = 200;
     		$output['status']['name'] = "success";
        $output['status']['description'] = "all ok";
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  // $output['data'] = $weather;
        $output['data'] = $finalResult;

      }

    }

	}

	echo json_encode($output, JSON_NUMERIC_CHECK); 
*/

if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["location"])) {
    $location = $_GET["location"];
    
    // Replace 'YOUR_API_KEY' with your actual API key
    $apiKey = '41663ae9d22a4b1ba10160256221312';
    $apiUrl = 'https://api.weatherapi.com/v1/forecast.json?q=' . urlencode($location) . '&key=' . $apiKey . '&days=4&aqi=no';
    
    // Initialize cURL session
    $curl = curl_init();

    // Set cURL options
    curl_setopt_array($curl, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
    ]);

    // Execute cURL request
    $response = curl_exec($curl);
    $err = curl_error($curl);

    // Close cURL session
    curl_close($curl);

    // Check for cURL errors
    if ($err) {
        echo "cURL Error #:" . $err;
    } else {
        // Output JSON response
        header('Content-Type: application/json');
        echo $response;
    }
} else {
    // Handle invalid requests
    echo "Invalid request!";
}
?>
