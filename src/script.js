// `https://openweathermap.org/payload/api/media/file/${iconName}.png`
import getWeatherInfo from "./getWeatherInfo.js";
const searchWeatherForm = document.querySelector("#search-weather");
const searchByCurrentLocation = document.querySelector("#current-location");
const lastSearchedCity =
  JSON.parse(localStorage.getItem("lastSearchedCity")) || [];

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
