$(document).ready(function() {
    let map;
    let markers = L.layerGroup();
    let countryBordersLayer = L.geoJSON();
    let layerControlMap;

function initializeMap() {
    const latitude = 0; 
    const longitude = 0; 

    map = L.map('map').setView([latitude, longitude], 13);
    

    const streetMapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    streetMapLayer.addTo(map);

    markers = L.markerClusterGroup();
    map.addLayer(markers);

    const baseMaps = {
        "Street Map": streetMapLayer,
        "Satellite Map": satelliteLayer
    };
    layerControlMap = L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);
}
    initializeMap();
    
    function handleGeolocation() {    
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
        
                $.ajax({
                    url: 'libs/php/getCountryCode.php',
                    type: 'GET',
                    data: {
                        lat: latitude,
                        lng: longitude,
                    },
                    dataType: 'json',
                    success: function (geonamesData) {
                        if (geonamesData && geonamesData.countryCode) {
                            const countryCode = geonamesData.countryCode;
        
                            $('#select').val(countryCode).change();
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR.responseText);
                        console.error("AJAX Error:", textStatus, errorThrown);
                    }
                });
            });
        }
    }
    handleGeolocation();

    navigator.geolocation.getCurrentPosition(function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        map.setView([latitude, longitude], 13);
    });


    const defaultStyle = {
        color: 'transparent', 
        weight: 0,     
    };
   

    let cityMarkers = L.markerClusterGroup();
    let airportMarkers = L.markerClusterGroup();
    let layerControl;
   
    function loadMarkers(selectedCountry) {

        $.ajax({
            url: 'libs/php/getCitiesAndAirports.php', 
            type: 'POST',
            data: { iso_a2: selectedCountry },
            dataType: 'json',
            success: function (data) {
                cityMarkers.clearLayers();
                airportMarkers.clearLayers();

                if (layerControl) {
                    map.removeControl(layerControl);
                }
                
                const cityMarkerIcon = L.ExtraMarkers.icon({
                    icon: 'fa-building',     
                    markerColor: 'blue',    
                    shape: 'circle',        
                    prefix: 'fa',           
                });
        
                const airportMarkerIcon = L.ExtraMarkers.icon({
                    icon: 'fa-plane',       
                    markerColor: 'green',  
                    shape: 'square',       
                    prefix: 'fa',           
                });                
        
                if (data.cityMarkers && data.cityMarkers.length > 0) {
                    data.cityMarkers.forEach(function (cityMarker) {
                        const marker = L.marker([cityMarker.lat, cityMarker.lng], {
                            icon: cityMarkerIcon
                        });
                        marker.bindPopup(`<b>${cityMarker.name}</b><br>${cityMarker.countryName}`);
                        cityMarkers.addLayer(marker);
                    });
                }
        
                if (data.airportMarkers && data.airportMarkers.length > 0) {
                    data.airportMarkers.forEach(function (airportMarker) {
                        const marker = L.marker([airportMarker.lat, airportMarker.lng], {
                            icon: airportMarkerIcon
                        });
                        marker.bindPopup(`<b>${airportMarker.name}</b><br>${airportMarker.countryName}`);
                        airportMarkers.addLayer(marker);
                    });
                }
        
                map.addLayer(cityMarkers);
                map.addLayer(airportMarkers);

                const overlyMaps = {
                    "Cities": cityMarkers,
                    "Airports": airportMarkers
                };
                  
                layerControl = L.control.layers(null, overlyMaps, { collapsed: false }).addTo(map);            
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText);
                console.error("AJAX Error:", textStatus, errorThrown);
            }
        });
    }

    $.ajax({
        url: 'libs/php/getCountries.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data.status.code === "200" && data.data) {
                var select = $('#select');

                select.append($('<option>', {
                    value: '', 
                    text: 'Select Country' 
                }));

                $.each(data.data, function(index, country) {
                    select.append($('<option>', {
                        value: country.iso_a2,
                        text: country.name,
                    }));
                });
            } 

            $('#select').on('change', function() {
                const selectedCountry = $(this).val();
                const selectedCountryName = $("#select option:selected").text();

                if (selectedCountry !== '') {
                    markers.clearLayers();
                    
                    $.ajax({
                        url: 'libs/php/getCountryFeatures.php',
                        type: 'POST',
                        data: { iso_a2: selectedCountry },
                        dataType: 'json',
                        success: function (countryFeature) {
                            if (countryFeature) {
                                if (map.hasLayer(countryBordersLayer)) {
                                    map.removeLayer(countryBordersLayer);
                                }

                                countryBordersLayer = L.geoJSON(countryFeature, {
                                    style: {
                                        color: 'red',
                                        weight: 1
                                    }
                                }).addTo(map);

                                map.fitBounds(countryBordersLayer.getBounds());
                            } else {
                                console.error("Failed to retrieve the selected country's feature.");
                            }        

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR.responseText);
                            console.error("AJAX Error:", textStatus, errorThrown);
                        }
                    });

                    loadMarkers(selectedCountry);
                }

    
                $.ajax({
                    url: 'libs/php/getNewsData.php',
                    type: 'POST',
                 data: { iso_a2: selectedCountry },
                    dataType: 'json',
                    success: function (newsData) {
                        const modalContentNews = $('#modalContentNews');
                        modalContentNews.empty();
        
                        if (newsData && newsData.results && newsData.results.length > 0) {
                            newsData.results.forEach(function (result) {
              
                                let imageUrl = result.image_url !== null ? result.image_url : 'assets/news.jpg';
                                let imageTag = `<img src="${imageUrl}" alt="News Image" class="img-fluid rounded" style="width: 45%;" />`;

                                let newsItem = `
                                    <div class="list-group-item d-flex flex-row justify-content-between">
                                        ${imageTag}
                                        <div style="width: 45%;">
                                            <a href="${result.link}" class="fw-bold fs-6 text-black" target="_blank">${result.title}</a> 
                                        </div>
                                    </div>
                                `;
                                modalContentNews.append(newsItem);
                            });
                        } else {
                            modalContentNews.append('<p>No news available for this country.</p>');
                        }
        
                        $('#toggleCountryNews').on('click', function () {
                            $('#newsModal').modal('toggle');
                        });
                    }, 
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR.responseText);
                        console.error("AJAX Error:", textStatus, errorThrown);
                    }
                });


                $.ajax({
                    url: 'libs/php/getCountryCoordinates.php',
                    type: 'POST',
                    data: { iso_a2: selectedCountry },
                    dataType: 'json',
                    success: function (countryCoordinates) {
                        if (countryCoordinates && countryCoordinates.latitude && countryCoordinates.longitude) {
                            const latitude = countryCoordinates.latitude;
                            const longitude = countryCoordinates.longitude;

                            getTimeZoneData(latitude, longitude);
                            getWikipediaData(latitude, longitude);
                              
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR.responseText);
                        console.error("AJAX Error:", textStatus, errorThrown);
                    }
                }); 




                $.ajax({
                    url: 'libs/php/getWeather.php',
                    type: 'GET',
                    data: { location: selectedCountryName },
                    dataType: 'json',
                    success: function (weatherData) {
                        if (weatherData) {
                            const countryCityName = $('#countryCityName');
                            let country = weatherData.location.country;
                            let city = weatherData.location.name;
                            countryCityName.empty();
                            countryCityName.append(`${country}, ${city}`);

                            if (country === "USA United States of America" && city === "Kingdom City") {
                                country = "United Kingdom";
                                city = "London";
                                countryCityName.empty();
                                countryCityName.append(`${country}, ${city}`);
                            }                     

                            const todayConditions = $('#todayConditions');
                            const todayIcon = $('#todayIcon');
                            const todayMaxTemp = $('#todayMaxTemp');
                            const todayMinTemp = $('#todayMinTemp');

                            // Populate today's weather data
                            const todayWeather = weatherData.forecast.forecastday[0].day;
                            const todayDescription = todayWeather.condition.text;
                            const todayMax = Math.round(todayWeather.maxtemp_c);
                            todayMaxTemp.text(todayMax);
                            const todayMin = Math.round(todayWeather.mintemp_c);
                            todayMinTemp.text(todayMin);
                            const todayIconUrl = todayWeather.condition.icon;

                            todayConditions.text(todayDescription);
                            todayMaxTemp.text(todayMax);
                            todayMinTemp.text(todayMin);
                            todayIcon.attr('src', 'https:' + todayIconUrl);

                            // Populate day 1 weather data
                            const day1Date = $('#day1Date');
                            const day1MaxTemp = $('#day1MaxTemp');
                            const day1MinTemp = $('#day1MinTemp');
                            const day1Icon = $('#day1Icon');

                            const day1Weather = weatherData.forecast.forecastday[1].day;
                            const day1DateValue = moment(weatherData.forecast.forecastday[1].date).format('ddd Do');
                            day1Date.text(day1DateValue);
                            const day1Max = Math.round(day1Weather.maxtemp_c);
                            day1MaxTemp.text(day1Max);
                            const day1Min = Math.round(day1Weather.mintemp_c);
                            day1MinTemp.text(day1Min);
                            day1Icon.attr('src', 'https:' + day1Weather.condition.icon);

                            // Populate day 2 weather data
                            const day2Date = $('#day2Date');
                            const day2MaxTemp = $('#day2MaxTemp');
                            const day2MinTemp = $('#day2MinTemp');
                            const day2Icon = $('#day2Icon');

                            const day2Weather = weatherData.forecast.forecastday[2].day;
                            const day2DateValue = moment(weatherData.forecast.forecastday[2].date).format('ddd Do');
                            day2Date.text(day2DateValue);
                            const day2Max = Math.round(day2Weather.maxtemp_c)
                            day2MaxTemp.text(day2Max);
                            const day2Min = Math.round(day2Weather.mintemp_c)
                            day2MinTemp.text(day2Min);
                            day2Icon.attr('src', 'https:' + day2Weather.condition.icon);

                            $('#toggleCountryWeather').on('click', function () {
                            $('#weatherModal').modal('toggle');
                            });
                        } else {
                            modalContentWeather.append('<p>No weather data available.</p>');
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR.responseText);
                        console.error("AJAX Error:", textStatus, errorThrown);
                    }
                });



                    function getTimeZoneData(latitude, longitude) {
                        $.ajax({
                            url: 'libs/php/getTimeZoneData.php', 
                            type: 'GET',
                            data: {
                                lat: latitude,
                                lng: longitude
                            },
                            dataType: 'json',
                            success: function (timeZoneData) {
                                if (timeZoneData) {
                                    $('#countryName').text(timeZoneData.countryName);

                                    const sunriseTime = new Date(timeZoneData.sunrise);
                                    $('#sunriseTime').text(formatTimeWithoutTimeZone(sunriseTime));

                                    const currentTime = new Date(timeZoneData.time);
                                    $('#currentTime').text(formatTimeWithoutTimeZone(currentTime));

                                    const sunsetTime = new Date(timeZoneData.sunset);
                                    $('#sunsetTime').text(formatTimeWithoutTimeZone(sunsetTime));
                                } else {
                                    modalContentTimezone.append('<p>No time zone data available.</p>');
                                }
                    
                                $('#toggleCountryTimezone').on('click', function () {
                                    $('#timezoneModal').modal('toggle');
                                });
                            }, 
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(jqXHR.responseText);
                                console.error("AJAX Error:", textStatus, errorThrown);
                            }
                        });
                    }

                    function formatTimeWithoutTimeZone(date) {
                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                   
                    
                    function getWikipediaData(latitude, longitude) {
                        $.ajax({
                            url: 'libs/php/getWikipediaData.php',
                            type: 'GET',
                            data: {
                                lat: latitude,
                                lng: longitude
                                },
                            dataType: 'json',
                            success: function (wikipediaData) {
                                const modalContentWikipedia = $('#modalContentWikipedia');
                                modalContentWikipedia.empty();


                            if (wikipediaData && wikipediaData.geonames && wikipediaData.geonames.length > 0) {
                                    modalContentWikipedia.append('<h4>Wikipedia Entries:</h4>');
                                    $.each(wikipediaData.geonames, function (index, entry) {
                                    const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(entry.title)}`;
                                    modalContentWikipedia.append(`<p><strong>Title:</strong> ${entry.title}</p>`);
                                    modalContentWikipedia.append(`<p><strong>Summary:</strong> ${entry.summary}. To find out more click <a href="${wikipediaUrl}" target="_blank">here</a>.</p>`);
                                    modalContentWikipedia.append('<hr>');
                                });
                                } else {
                                    modalContentWikipedia.append('<p>No Wikipedia entries found for this location.</p>');
                                }
                    

                                $('#toggleCountryWikipedia').on('click', function () {
                                    $('#wikipediaModal').modal('toggle');
                                });
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(jqXHR.responseText);
                                console.error("AJAX Error:", textStatus, errorThrown);
                            }
                        });
                    }

                    let globalCurrencyCode = '';

                    $.ajax({
                        url: 'libs/php/getCountryData.php',
                        type: 'POST',
                        data: { iso_a2: selectedCountry },
                        dataType: 'json',
                        success: function (countryData) {
                            if (countryData.currencyCode) {
                                 globalCurrencyCode = countryData.currencyCode;
                            }
                    
                            $('#country').text(countryData.countryName);
                            $('#capitalCity').text(countryData.capital);
                            $('#continent').text(countryData.continent);
                            const formattedPopulation = numeral(countryData.population).format('0,0');
                            $('#population').text(formattedPopulation);
                            $('#currency').text(countryData.currencyCode);                
                                                    
                        $('#toggleCountryInfo').on('click', function () {
                            $('#countryInfoModal').modal('toggle');
                        });
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR.responseText);
                            console.error("AJAX Error:", textStatus, errorThrown);
                        }
                    });


                        
                    $('#currencyConverterModal').on('show.bs.modal', function (e) {
                        let selectedCountry = $('#select').val();
                        
                        $('#amountToConvert').val('');
                        $('#convertedResult').val('');
                    
                        function performCurrencyConversion(selectedCountry, currencyCode) {
                            $.ajax({
                                url: 'libs/php/getCurrencyConverter.php',
                                type: 'POST',
                                data: {
                                    iso_a2: selectedCountry,
                                    currencyCode: currencyCode,
                                },
                                dataType: 'json',
                                success: function (responseData) {
                                    updateConversionResult(responseData, currencyCode);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log(jqXHR.responseText);
                                    console.error("AJAX Error:", textStatus, errorThrown);
                                }
                            });
                        }


                        function updateConversionResult(responseData, currencyCode) {
                            if (responseData && responseData.convertedAmount) {
                                const convertedAmount = parseFloat(responseData.convertedAmount);
                                const amountToConvert = $('#amountToConvert').val() || 0;
                                const result = amountToConvert * convertedAmount;
                                $('#convertedResult').val(`${result.toFixed(2)} ${currencyCode}`);
                            } else {
                                $('#convertedResult').val('Currency conversion failed.');
                            }
                        }

                        performCurrencyConversion(selectedCountry, globalCurrencyCode);

                        $('#amountToConvert').on('input', function() {
                            performCurrencyConversion(selectedCountry, globalCurrencyCode);
                        });
                    });
                    
            });            


        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.responseText);
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
});

