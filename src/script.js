import getWeatherInfo from "./getWeatherInfo.js";

const searchWeatherForm = document.querySelector("#search-weather");
const searchByCurrentLocation = document.querySelector("#current-location");
const temperatureToggleButton = document.querySelector("#temperature-toggle");
const cities = JSON.parse(localStorage.getItem("lastSearchedCity")) || [];
let tempFormat = localStorage.getItem("temperatureFormat") || "celsius";

// Initialize the page once the DOM is ready.
// Registers event listeners and loads the default weather.
function init() {
  searchWeatherForm.addEventListener("submit", searchFormHandler);
  searchByCurrentLocation.addEventListener("click", currentLocationHandler);
  temperatureToggleButton.addEventListener("click", temperatureToggle);

  displayRecentSearchedCities();
  updateTemperatureButton();
  loadDefaultWeather();
}

document.addEventListener("DOMContentLoaded", init);

// Load the default weather data for the first  view.
async function loadDefaultWeather() {
  const defaultCity = "delhi";
  const weatherInfo = await getWeatherInfo(defaultCity);
  if (weatherInfo.success) {
    displayWeatherInfo(weatherInfo);
  } else {
    toastMessage(
      "error",
      `Failed to load default weather ${weatherInfo.error}`,
    );
  }
}

// Handle city search form submission.
async function searchFormHandler(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const cityName = validateCityName(formData.get("city-name"));
  if (!cityName) {
    return;
  }
  const weatherInfo = await getWeatherInfo(cityName);
  if (weatherInfo.success) {
    displayWeatherInfo(weatherInfo);
    addRecentCity(cityName);
    event.target.reset();
  } else {
    toastMessage(
      "error",
      `The city name is incorrect. Please correct it and re-enter.`,
    );
  }
}

// Validate the entered city name and return a normalized value.
function validateCityName(cityName) {
  if (
    typeof cityName === "string" &&
    /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(cityName.trim())
  ) {
    return cityName.trim().toLowerCase();
  }
  return null;
}

// Request the user's current location and load weather for that position.
function currentLocationHandler() {
  if (!navigator.geolocation) {
    toastMessage("error", "Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const weatherInfo = await getWeatherInfo(
        undefined,
        position.coords.latitude,
        position.coords.longitude,
      );

      if (weatherInfo.success) {
        displayWeatherInfo(weatherInfo);
      } else {
        toastMessage(
          "error",
          `Failed to load weather for current location: ${weatherInfo.error}`,
        );
      }
    },
    (error) => {
      toastMessage("error", `Geolocation error: ${error.message}`);
    },
  );
}

// Save a city to the recent search list.
function addRecentCity(cityName) {
  if (!cities.includes(cityName)) {
    cities.unshift(cityName);
    if (cities.length > 5) {
      cities.pop();
    }
    localStorage.setItem("lastSearchedCity", JSON.stringify(cities));
  }

  displayRecentSearchedCities();
}

// Render the list of recent searched cities.
function displayRecentSearchedCities() {
  const searchedCityContainer = document.querySelector("#recent-search");
  const searchCityStatic = document.querySelector("#recent-search-static");
  searchedCityContainer.innerHTML = "";
  cities.length === 0
    ? (searchCityStatic.style.display = "none")
    : (searchCityStatic.style.display = "flex");
  cities.forEach((city) => {
    const cityElement = document.createElement("p");
    cityElement.textContent = city
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    cityElement.classList.add("city-pill");
    searchedCityContainer.appendChild(cityElement);
  });

  searchedCityContainer.addEventListener("click", displaySeachCity);
}

// Display the recent search city data
async function displaySeachCity(event) {
  const cityName = event.target.closest("p")?.textContent.toLowerCase();
  if (!cityName) return;

  const searchCityWeatherData = await getWeatherInfo(cityName);
  if (searchCityWeatherData.success) {
    displayWeatherInfo(searchCityWeatherData);
  }
}

// Display the main weather information on the page.
function displayWeatherInfo(weatherData) {
  const dataLocation = document.querySelectorAll("[data-location]");
  const forecastCardContainer = document.querySelector("#weather-forecast");
  forecastCardContainer.innerHTML = "";
  updateBackground_showAlert(
    weatherData.data.current.weather[0].main,
    weatherData.data.current.main.temp,
  );
  updateData(weatherData.data);

  for (let address of dataLocation) {
    if (address.tagName === "IMG") {
      address.src = convertDataAddress(
        address.dataset.location,
        weatherData.data,
      );
    } else {
      address.textContent = convertDataAddress(
        address.dataset.location,
        weatherData.data,
      );
    }
  }

  weatherData.data.forecast.fiveDays.forEach((currentDay) => {
    updateData(currentDay, "forecast");
    renderWeatherForecast(currentDay, forecastCardContainer);
  });
}

// Update the current weather object with formatted values.
function updateData(data, branch = "current") {
  if (!data) {
    return;
  }

  const aqiColoredElement = document.querySelectorAll("#aqi-color");
  const branchRequest = branch !== "current" ? data : data.current;

  if (branch === "current") {
    branchRequest.location = `${branchRequest.name}, ${new Intl.DisplayNames(["en"], { type: "region" }).of(branchRequest.sys.country)}`;
    branchRequest.dt = `${new Date(branchRequest.dt * 1000).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} | ${new Date(branchRequest.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    data.forecast.fiveDays = data.forecast.list.filter((item) =>
      item.dt_txt.includes("12:00:00"),
    );
    data.aqi.list[0].main.detailed = getDetailedAQI(
      data.aqi.list[0].components,
    );
    aqiColoredElement.forEach((element) => {
      element.style.color = data.aqi.list[0].main.detailed.color;
    });
  } else {
    branchRequest.day = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(new Date(branchRequest.dt * 1000));
    branchRequest.date = `${new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(branchRequest.dt * 1000))}`;
  }

  branchRequest.main.temp = formatTemperature(branchRequest.main.temp);
  branchRequest.main.feels_like = formatTemperature(
    branchRequest.main.feels_like,
  );
  branchRequest.visibility = branchRequest.visibility / 1000;
  branchRequest.weather[0].iconUrl = `https://openweathermap.org/img/wn/${branchRequest.weather[0].icon}@4x.png`;
}

// Convert a temperature value from Celsius to the selected format.
function formatTemperature(celsiusValue) {
  if (tempFormat === "celsius") {
    return `${Math.round(celsiusValue)}°C`;
  }

  return `${Math.round((celsiusValue * 9) / 5 + 32)}°F`;
}

// Convert data address into useable form
function convertDataAddress(dataAddress, rowData) {
  let convertedData = dataAddress
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((key, value) => key?.[value], rowData);
  if (Number.isFinite(convertedData)) {
    convertedData = Math.round(convertedData);
  }
  return convertedData;
}

// Switch the selected temperature format and update the UI.
function temperatureToggle(event) {
  const selectedFormat = event.target.dataset.temperatureFormat;
  const updateTemperatureInfo = document.querySelectorAll("#temp-format");

  if (!selectedFormat || selectedFormat === tempFormat) {
    return;
  }

  tempFormat = selectedFormat;
  updateTemperatureInfo.forEach((element) => {
    if (tempFormat !== "celsius") {
      element.textContent = `${Math.round((parseInt(element.textContent) * 9) / 5 + 32)}°F`;
    } else {
      element.textContent = `${Math.round(((parseInt(element.textContent) - 32) * 5) / 9)}°C`;
    }
  });

  localStorage.setItem("temperatureFormat", tempFormat);
  updateTemperatureButton();
}

// Highlight the current temperature toggle option.
function updateTemperatureButton() {
  const temperatureToggleOptions = document.querySelectorAll(
    "[data-temperature-format]",
  );

  temperatureToggleOptions.forEach((option) => {
    const isActive = option.dataset.temperatureFormat === tempFormat;
    option.classList.toggle("bg-primary", isActive);
    option.classList.toggle("text-white", isActive);
    option.classList.toggle("bg-white", !isActive);
    option.classList.toggle("text-black", !isActive);
  });
}

// Find AQI value based on the PM2.5 concentration and PM10 levels and return the corresponding AQI category.
// Define US EPA Breakpoint arrays
const pm25Breakpoints = [
  { cpLo: 0.0, cpHi: 9.0, aqiLo: 0, aqiHi: 50 },
  { cpLo: 9.1, cpHi: 35.4, aqiLo: 51, aqiHi: 100 },
  { cpLo: 35.5, cpHi: 55.4, aqiLo: 101, aqiHi: 150 },
  { cpLo: 55.5, cpHi: 125.4, aqiLo: 151, aqiHi: 200 },
  { cpLo: 125.5, cpHi: 225.4, aqiLo: 201, aqiHi: 300 },
  { cpLo: 225.5, cpHi: 325.4, aqiLo: 301, aqiHi: 400 },
  { cpLo: 325.5, cpHi: 500.4, aqiLo: 401, aqiHi: 500 },
];

const pm10Breakpoints = [
  { cpLo: 0, cpHi: 54, aqiLo: 0, aqiHi: 50 },
  { cpLo: 55, cpHi: 154, aqiLo: 51, aqiHi: 100 },
  { cpLo: 155, cpHi: 254, aqiLo: 101, aqiHi: 150 },
  { cpLo: 255, cpHi: 354, aqiLo: 151, aqiHi: 200 },
  { cpLo: 355, cpHi: 424, aqiLo: 201, aqiHi: 300 },
  { cpLo: 425, cpHi: 504, aqiLo: 301, aqiHi: 400 },
  { cpLo: 505, cpHi: 604, aqiLo: 401, aqiHi: 500 },
];

const AQI_map = [
  {
    min: 0,
    max: 50,
    level: "Good",
    recommendation:
      "Outdoor activities can be enjoyed without restrictions. No special precautions are required.",
    color: "#1A8013",
  },
  {
    min: 51,
    max: 100,
    level: "Moderate",
    recommendation:
      "Most people can continue normal outdoor activities. Individuals with heightened sensitivity should monitor symptoms during extended outdoor exposure.",
    color: "#99C953",
  },
  {
    min: 101,
    max: 150,
    level: "Unhealthy for Sensitive Groups",
    recommendation:
      "Children, older adults, pregnant individuals, and people with heart or lung conditions should consider reducing prolonged or strenuous outdoor activities.",
    color: "#DAB13F",
  },
  {
    min: 151,
    max: 200,
    level: "Unhealthy",
    recommendation:
      "Reduce prolonged outdoor exertion. Sensitive individuals should limit time outdoors and follow any existing medical management plans.",
    color: "#D67316",
  },
  {
    min: 201,
    max: 300,
    level: "Very Unhealthy",
    recommendation:
      "Avoid prolonged or strenuous outdoor activities. Consider moving exercise and recreational activities indoors. Keep windows closed if outdoor air quality is affecting indoor environments.",
    color: "#8E1562",
  },
  {
    min: 301,
    max: 500,
    level: "Hazardous",
    recommendation:
      "Avoid outdoor activities whenever possible. Remain indoors, minimize exposure to outdoor air, and use air filtration systems if available. Follow guidance from local health authorities.",
    color: "#62004d",
  },
];

// Calculate the air quality index
function calculateSubIndex(cp, breakpoints) {
  const bp = breakpoints.find((b) => cp >= b.cpLo && cp <= b.cpHi);
  if (!bp) return 500;

  const aqi =
    ((bp.aqiHi - bp.aqiLo) / (bp.cpHi - bp.cpLo)) * (cp - bp.cpLo) + bp.aqiLo;
  return Math.round(aqi);
}

function getDetailedAQI({ pm2_5, pm10 }) {
  const pm25_fixed = Math.round(pm2_5 * 10) / 10;
  const pm10_fixed = Math.round(pm10);
  const pm25_index = calculateSubIndex(pm25_fixed, pm25Breakpoints);
  const pm10_index = calculateSubIndex(pm25_fixed, pm10Breakpoints);
  const AQI_index = Math.max(pm25_index, pm10_index);
  const overallAQIData =
    AQI_index > 500
      ? AQI_map[AQI_map.length - 1]
      : AQI_map.find(
          (range) => AQI_index >= range.min && AQI_index <= range.max,
        );

  return {
    aqi: AQI_index,
    level: overallAQIData.level,
    recommendation: overallAQIData.recommendation,
    color: overallAQIData.color,
  };
}

// Create forecast card and render on screen
function renderWeatherForecast(forecastData, forecastLocation) {
  const forecastCard = document.createElement("div");
  const forecastDay = document.createElement("h3");
  const forecastDate = document.createElement("p");
  const iconTempDiv = document.createElement("div");
  const forecastIcon = document.createElement("img");
  const forecastTemp = document.createElement("p");
  const windHumidityDiv = document.createElement("div");
  const windDiv = document.createElement("div");
  const humidityDiv = document.createElement("div");
  const windIcon = document.createElement("img");
  const forecastWind = document.createElement("p");
  const humidityIcon = document.createElement("img");
  const forecastHumidity = document.createElement("p");

  windIcon.src = "./src/images/icons/Wind.svg";
  humidityIcon.src = "./src/images/icons/Humidity.svg";
  forecastIcon.src = forecastData.weather[0].iconUrl;
  forecastIcon.alt = `${forecastData.weather[0].description} Icon`;
  humidityIcon.alt = "Humidity icon";
  windIcon.alt = "Wind Icon";
  forecastDay.textContent = forecastData.day;
  forecastDate.textContent = forecastData.date;
  forecastTemp.textContent = forecastData.main.temp;
  forecastTemp.id = "temp-format";
  forecastWind.textContent = `${Math.round(forecastData.wind.speed)} km/h`;
  forecastHumidity.textContent = `${forecastData.main.humidity}%`;

  iconTempDiv.append(forecastIcon, forecastTemp);
  windDiv.append(windIcon, forecastWind);
  humidityDiv.append(humidityIcon, forecastHumidity);
  windHumidityDiv.append(windDiv, humidityDiv);
  forecastCard.append(forecastDay, forecastDate, iconTempDiv, windHumidityDiv);
  forecastCard.classList.add("weather-forecast-card");
  forecastLocation.append(forecastCard);
}

// Set background image based on weather condition and Show alert if temprature above 40.
function updateBackground_showAlert(condition, temp) {
  const alertContainer = document.querySelector("#alert-static");
  const backgroundImageContainer = document.querySelector(
    "#background-image-static img",
  );
  alertContainer.innerHTML = "";
  const backgroundImage = {
    Clear: "clear.webp",
    Clouds: "clouds.webp",
    Drizzle: "drizzle.webp",
    Rain: "rain.webp",
    Thunderstorm: "thunderstorm.webp",
    Snow: "snow.webp",
    Mist: "smoke_mist_haze.webp",
    Smoke: "smoke_mist_haze.webp",
    Haze: "smoke_mist_haze.webp",
    Dust: "dust_sand_ash_squall_tornado.webp",
    Sand: "dust_sand_ash_squall_tornado.webp",
    Ash: "dust_sand_ash_squall_tornado.webp",
    Squall: "dust_sand_ash_squall_tornado.webp",
    Tornado: "dust_sand_ash_squall_tornado.webp",
  };

  if (backgroundImage[condition]) {
    backgroundImageContainer.src = `./src/images/${backgroundImage[condition]}`;
  }

  if (temp >= 40) {
    alertContainer.style.display = "flex";
    alertContainer.classList.add("alert-container");
    const alertMessage = document.createElement("p");
    const messageTemp = document.createElement("span");
    const alertIcon = document.createElement("img");
    alertIcon.src = "./src/images/Icons/alert.svg";
    alertIcon.alt = "alert Icon";
    messageTemp.textContent = formatTemperature(temp);
    messageTemp.setAttribute("id", "temp-format");
    alertMessage.textContent = `Current temperature is `;
    alertMessage.append(messageTemp);
    alertMessage.append(
      ` with ${condition.toLowerCase()} conditions. The weather is extremely hot and staying outside for long periods may cause dehydration or exhaustion. Drink plenty of water, avoid unnecessary sun exposure, and try to stay cool.`,
    );
    alertContainer.append(alertIcon, alertMessage);
  } else {
    alertContainer.style.display = "none";
  }
}

// Toast message
function toastMessage(type = "error", message) {
  const toastMessageContainer = document.querySelector(
    "#toast-message-container",
  );
  const toastMessage = document.createElement("div");
  toastMessage.textContent = message;
  toastMessage.classList.add(type);
  toastMessageContainer.appendChild(toastMessage);

  setTimeout(() => {
    toastMessage.classList.add("show");
  }, 50);

  setTimeout(() => {
    toastMessage.classList.remove("show");
    setTimeout(() => {
      toastMessageContainer.removeChild(toastMessage);
    }, 600);
  }, 3000);
}
