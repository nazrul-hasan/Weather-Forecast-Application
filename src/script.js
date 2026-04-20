import getWeatherData from "./getWeatherData.js";
const searchWeatherForm = document.querySelector("#search-weather");
const searchByCurrentLocation = document.querySelector("#current-location");

const weatherData = getWeatherData();

searchWeatherForm.addEventListener("submit", searchFormHandler);
searchByCurrentLocation.addEventListener(
  "click",
  searchByCurrentLocationHandler,
);

function searchFormHandler(e) {
  const formData = new FormData(e.target);
  const cityName = validateCityName(formData.get("city-name"));
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

function searchByCurrentLocationHandler(e) {
  console.log(e.target);
}
