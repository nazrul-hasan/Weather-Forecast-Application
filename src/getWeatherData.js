export default function getWeatherData() {
  const API_KEY = "0a8556dacfbf0be3914d5c5563991c23";
  const BASE_URL = "https://api.openweathermap.org/data/2.5/";

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    getByCity: async (cityName) => {
      return await fetchData(
        `${BASE_URL}weather?q=${cityName}&appid=${API_KEY}&units=metric`,
      );
    },
    getByCurrentLocation: async (latitude, longitude) => {
      return await fetchData(
        `${BASE_URL}weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
      );
    },
    getAQIData: async (latitude, longitude) => {
      return await fetchData(
        `${BASE_URL}air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`,
      );
    },
    getFiveDaysForecast: async (cityName) => {
      return await fetchData(
        `${BASE_URL}forecast?q=${cityName}&appid=${API_KEY}&units=metric`,
      );
    },
  };
}
