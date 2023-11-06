$(document).ready(function() {
    let map;
    let markers;
    let countryBordersLayer = L.geoJSON();

    function initializeMap() {
        const latitude = 0; 
        const longitude = 0; 

        map = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        markers = L.markerClusterGroup();
        map.addLayer(markers);
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
   

    const cityMarkers = L.layerGroup();
    const airportMarkers = L.layerGroup();
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

                const baseLayers = {
                    "Cities": cityMarkers,
                    "Airports": airportMarkers
                };
                  
                layerControl = L.control.layers(null, baseLayers, { collapsed: false }).addTo(map);            
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
                        text: country.name
                    }));
                });
            } 

            $('#select').on('change', function() {
                const selectedCountry = $(this).val();
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

        //OVAJ DIO KODA
        $.ajax({
            url: 'libs/php/getNewsData.php',
            type: 'POST',
            data: { iso_a2: selectedCountry },
            dataType: 'json',
            success: function (newsData) {
                const modalContentNews = $('#modalContentNews');
                modalContentNews.empty();
                if (newsData && newsData.results && newsData.results.length > 0) {
                    //console.log('newsData:', newsData.results);

                    newsData.results.forEach(function (result) {
                        let newsItem = `
                            <div class="list-group-item d-flex flex-row justify-content-between">
                                <img src="${result.image_url}" alt="News Image" class="img-fluid rounded" style="width: 45%;" />
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

                            getWeatherData(latitude, longitude);
                            getTimeZoneData(latitude, longitude);
                            getWikipediaData(latitude, longitude);
                              
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR.responseText);
                        console.error("AJAX Error:", textStatus, errorThrown);
                    }
                }); 

                function getWeatherData(latitude, longitude) {
                    $.ajax({
                        url: 'libs/php/getWeatherData.php',
                        type: 'GET',
                        data: {
                            lat: latitude,
                            lon: longitude
                        },
                        dataType: 'json',
                        success: function (weatherData) {                           
                            if (weatherData) {
                                const weatherIcon = $('#todayIcon');
                                const weatherConditions = $('#todayConditions');
                                const maxTemperature = $('#todayMaxTemp');
                                const minTemperature = $('#todayMinTemp');
                                
                                const description = weatherData.weather[0].description;
                                const capitalizedDescription = description.charAt(0).toUpperCase() + description.slice(1);
                                weatherConditions.text(capitalizedDescription);
                            
                                const weatherIconCode = weatherData.weather[0].icon;                        
                                const weatherIconUrl = `https://openweathermap.org/img/w/${weatherIconCode}.png`;                              
                                weatherIcon.attr('src', weatherIconUrl);
                              
                                const temperatureInKelvinMax = weatherData.main.temp_max;
                                const temperatureInCelsiusMax = temperatureInKelvinMax - 273.15;
                                const formattedTemperatureMax = numeral(temperatureInCelsiusMax).format('0,0.00');
                                maxTemperature.text(formattedTemperatureMax);

                                const temperatureInKelvinMin = weatherData.main.temp_max;
                                const temperatureInCelsiusMin = temperatureInKelvinMin - 273.15;
                                const formattedTemperatureMin = numeral(temperatureInCelsiusMin).format('0,0.00');
                                minTemperature.text(formattedTemperatureMin);
                            } else {
                                modalContentWeather.append('<p>No weather data available.</p>');
                            }

                            $('#toggleCountryWeather').on('click', function () {
                                 $('#weatherModal').modal('toggle');
                                });
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(jqXHR.responseText);
                                console.error("AJAX Error:", textStatus, errorThrown);
                            }                            
                        });
                    }



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
                                const modalContentTimezone = $('#modalContentTimezone');
                                modalContentTimezone.empty();
                    
                                if (timeZoneData) {
                                    modalContentTimezone.append(`<p><strong>Country:</strong> ${timeZoneData.countryName}</p>`);
        
                                    const sunriseTime = new Date(timeZoneData.sunrise);
                                    modalContentTimezone.append(`<p><strong>Sunrise Time:</strong> ${sunriseTime}</p>`); 
                                    
                                    const sunsetTime = new Date(timeZoneData.sunset);
                                    modalContentTimezone.append(`<p><strong>Sunset Time:</strong> ${sunsetTime}</p>`); 
                            
                                    const currentTime = new Date(timeZoneData.time);
                                    modalContentTimezone.append(`<p><strong>Current Time:</strong> ${currentTime}</p>`); 
                                } else {
                                    modalContentTimezone.append('<p>No time zone data available.</p>');
                                }
                    
                                $('#toggleCountryTimezone').on('click', function () {
                                    $('#TimezoneModal').modal('toggle');
                                });
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(jqXHR.responseText);
                                console.error("AJAX Error:", textStatus, errorThrown);
                            }
                        });
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
                    

                $.ajax({
                    url: 'libs/php/getCountryData.php',
                    type: 'POST',
                    data: { iso_a2: selectedCountry },
                    dataType: 'json',
                    success: function(countryData) {
                        if (countryData.currencyCode) {
                            const currencyCode = countryData.currencyCode;
            
                            performCurrencyConversion(currencyCode);
                        }

                        const modalContentInfo = $('#modalContentInfo');
                        modalContentInfo.empty();
                        modalContentInfo.append(`<p><strong>Country:</strong> ${countryData.countryName}</p>`);
                        modalContentInfo.append(`<p><strong>Capital:</strong> ${countryData.capital}</p>`);
                        modalContentInfo.append(`<p><strong>Continent:</strong> ${countryData.continent}</p>`);
                        const formattedPopulation = numeral(countryData.population).format('0,0');
                        modalContentInfo.append(`<p><strong>Population:</strong> ${formattedPopulation}</p>`);
                        modalContentInfo.append(`<p><strong>Currency:</strong> ${countryData.currencyCode}</p>`);
                        
                        $('#toggleCountryInfo').on('click', function () {
                            $('#countryModal').modal('toggle');
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR.responseText);
                        console.error("AJAX Error:", textStatus, errorThrown);
                    }
                })
                
                function performCurrencyConversion(currencyCode) {
                    $.ajax({
                        url: 'libs/php/getCurrencyConverter.php', 
                        type: 'POST',
                        data: {
                            iso_a2: selectedCountry,
                            currencyCode: currencyCode,
                        },
                        dataType: 'json',
                        success: function (responseData) {
                            $('#amountToConvert').on('input', function () {
                                if (responseData && responseData.convertedAmount) {
                                    const convertedAmount = parseFloat(responseData.convertedAmount);
                                    const amountToConvert = $('#amountToConvert').val();
                                    const result = amountToConvert * convertedAmount;
                                    $('#convertedResult').text(`Converted amount: ${result.toFixed(2)} ${currencyCode}`);
                                    
                                } else {2
                                    $('#convertedResult').text('Currency conversion failed.');
                                }
                            }) 

                            $('#toggleCurrencyConverter').on('click', function () {
                                $('#currencyConverterModal').modal('toggle');
                            });
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR.responseText);
                            console.error("AJAX Error:", textStatus, errorThrown);
                        }
                    });
                }
            });            


        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.responseText);
            console.error("AJAX Error:", textStatus, errorThrown);
        }
    });
});

