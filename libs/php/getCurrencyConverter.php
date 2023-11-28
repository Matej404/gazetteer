<?php
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["iso_a2"]) && isset($_POST["currencyCode"])) {
    $selectedCountry = $_POST["iso_a2"];
    $selectedCurrencyCode = $_POST["currencyCode"];
    
    $apiKey = "fc3b3357839b406bb84f486a";

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/USD");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $exchangeRatesResponse = curl_exec($ch);

    if ($exchangeRatesResponse !== false) {
        $exchangeRateData = json_decode($exchangeRatesResponse, true);

        if ($exchangeRateData && isset($exchangeRateData["base_code"]) && isset($exchangeRateData["conversion_rates"][$selectedCurrencyCode])) {
           
            $selectedCountryCurrencyRate = $exchangeRateData["conversion_rates"][$selectedCurrencyCode];

            $usdAmount = 1.00;

            $convertedAmount = $usdAmount * $selectedCountryCurrencyRate;

            $responseData = [
                "convertedAmount" => number_format($convertedAmount, 2),
                "selectedCountryCurrencyCode" => $selectedCurrencyCode,
            ];

            header("Content-Type: application/json");
            echo json_encode($responseData);
        } else {
            header("HTTP/1.1 400 Bad Request");
            echo json_encode(["error" => "Invalid data or currency code not found."]);
        }
    } else {
        header("HTTP/1.1 500 Internal Server Error");
        echo json_encode(["error" => "Failed to fetch exchange rates from API."]);
    }
} else {
    header("HTTP/1.1 400 Bad Request");
    echo json_encode(["error" => "Invalid request parameters."]);
}
?>

