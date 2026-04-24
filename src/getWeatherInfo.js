import getWeatherData from "./getWeatherData.js";
const weatherData = getWeatherData();

export default function getWeatherInfo(city, latitude, longitude) {
  let allWeatherInformation = [];
  const weatherInfo =
    latitude !== undefined && longitude !== undefined
      ? weatherData.getByCurrentLocation(latitude, longitude)
      : weatherData.getByCity(city);

  weatherInfo.then((response) => {
    if (!response.success) {
      console.log("Error fetching weather data: " + response.error);
      return;
    } else {
      allWeatherInformation.push(response.data);
    }

    const weatherForecast = weatherData.getFiveDaysForecast(response.data.name);
    weatherForecast.then((forecastResponse) => {
      if (!forecastResponse.success) {
        console.log(
          "Error fetching weather forecast: " + forecastResponse.error,
        );
        return;
      } else {
        allWeatherInformation.push(forecastResponse.data);
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
        allWeatherInformation.push(aqiResponse.data);
      }
    });

    console.log(allWeatherInformation);
  });
}
