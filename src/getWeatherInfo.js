import getWeatherData from "./getWeatherData.js";
const weatherData = getWeatherData();

export default async function getWeatherInfo(city, latitude, longitude) {
  const weatherResponse = await (latitude !== undefined &&
  longitude !== undefined
    ? weatherData.getByCurrentLocation(latitude, longitude)
    : weatherData.getByCity(city));

  if (!weatherResponse.success) {
    return { success: false, error: weatherResponse.error };
  }

  const { name, coord } = weatherResponse.data;
  const [forecastResponse, aqiResponse, aqiForecastResponse] =
    await Promise.all([
      weatherData.getFiveDaysForecast(name),
      weatherData.getAQIData(coord.lat, coord.lon),
      weatherData.getFiveDaysAQIForecast(coord.lat, coord.lon),
    ]);

  if (!forecastResponse.success) {
    return { success: false, error: forecastResponse.error };
  }

  if (!aqiResponse.success) {
    return { success: false, error: aqiResponse.error };
  }

  if (!aqiForecastResponse.success) {
    return { success: false, error: aqiForecastResponse.error };
  }

  return {
    success: true,
    data: {
      current: weatherResponse.data,
      forecast: forecastResponse.data,
      aqi: aqiResponse.data,
      aqiForecast: aqiForecastResponse.data,
    },
  };
}
