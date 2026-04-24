import getWeatherData from "./getWeatherData.js";
const searchWeatherForm = document.querySelector("#search-weather");
const searchByCurrentLocation = document.querySelector("#current-location");
const weatherData = getWeatherData();

searchWeatherForm.addEventListener("submit", searchFormHandler);
searchByCurrentLocation.addEventListener("click", currentLocationHandler);
window.addEventListener("load", getWeatherInfo("delhi", undefined, undefined));

function searchFormHandler(e) {
  const formData = new FormData(e.target);
  const cityName = validateCityName(formData.get("city-name"));
  getWeatherInfo(cityName, undefined, undefined);
  e.preventDefault();
  e.target.reset();
}

function validateCityName(cityName) {
  if (typeof cityName === "string" && /^[A-Za-z]+$/.test(cityName)) {
    return cityName.trim().toLowerCase();
  } else {
    console.error("The city name is incorrect");
  }
}

function currentLocationHandler() {
  navigator.geolocation.getCurrentPosition((position) => {
    getWeatherInfo(
      undefined,
      position.coords.latitude,
      position.coords.longitude,
    );
  });
}

function getWeatherInfo(city, latitude, longitude) {
  let allWeatherinformation = [];
  const weatherInfo =
    latitude === undefined && longitude === undefined
      ? weatherData.getByCity(city)
      : weatherData.getByCurrentLocation(latitude, longitude);

  weatherInfo.then((response) => {
    if (!response.success) {
      console.log("Error fetching weather data: " + response.error);
      return;
    } else {
      allWeatherinformation.push(response.data);
    }

    const weatherForecast = weatherData.getFiveDaysForecast(response.data.name);
    weatherForecast.then((forecastResponse) => {
      if (!forecastResponse.success) {
        console.log(
          "Error fetching weather forecast: " + forecastResponse.error,
        );
        return;
      } else {
        allWeatherinformation.push(forecastResponse.data);
      }
    });

    const aqiData = weatherData.getAQIData(
      response.data.coord.lat,
      response.data.coord.lon,
    );
    aqiData.then((aqiResponse) => {
      if (!aqiResponse.success) {
        console.log("Error fetching AQI data: " + aqiResponse.error);
        return;
      } else {
        allWeatherinformation.push(aqiResponse.data);
      }
    });

    console.log(allWeatherinformation);
  });
}
