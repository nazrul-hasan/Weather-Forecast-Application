import getWeatherData from "./getWeatherData.js";
const weatherData = getWeatherData();

function getErrorIfFailed(response, label) {
  if (!response.success) {
    return { success: false, error: `${label}: ${response.error}` };
  }

  return { success: true };
}

export default async function getWeatherInfo(city, latitude, longitude) {
  // Use coordinates when available, otherwise search by city name.
  const weatherResponse = await (latitude !== undefined &&
  longitude !== undefined
    ? weatherData.getByCurrentLocation(latitude, longitude)
    : weatherData.getByCity(city));

  if (!weatherResponse.success) {
    return { success: false, error: weatherResponse.error };
  }

  const { name, coord } = weatherResponse.data;

  // Load forecast and air-quality data in parallel.
  const [forecastResponse, aqiResponse] = await Promise.all([
    weatherData.getFiveDaysForecast(name),
    weatherData.getAQIData(coord.lat, coord.lon),
  ]);

  // Error handling for each dependent response.
  const responses = [
    { response: forecastResponse, label: "Forecast" },
    { response: aqiResponse, label: "AQI" },
  ];

  for (const { response, label } of responses) {
    const errorResult = getErrorIfFailed(response, label);
    if (!errorResult.success) {
      return errorResult;
    }
  }

  return {
    success: true,
    data: {
      current: weatherResponse.data,
      forecast: forecastResponse.data,
      aqi: aqiResponse.data,
    },
  };
}
