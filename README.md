# Weather \& Air Quality App

## A simple web application to check current weather, air quality, and a 5-day weather forecast. Users can search by city or use their current location to get real-time weather information.



## What This App Does

1. search for weather by city name
2. use the browser's location to get weather for the current area
3. see current temperature, weather condition, humidity, wind, visibility, and pressure
4. view air quality information (AQI) and main pollutants
5. get a 5-day weather forecast
6. save recent city searches so they are easy to reuse
7. switch between Celsius and Fahrenheit
8. Weather alerts for extreme conditions
9. Dynamic background based on weather conditions



## How to Run The Project

1. Clone the repository
2. Open the project folder
3. Add your OpenWeather API key inside src/getWeatherData.js.
4. Open index.html in your browser



### Technologies Used

* HTML5
* Tailwind CSS
* JavaScript (ES6)
* OpenWeather API
* Local Storage



### How The App is Organized

1. ###### index.html

   * The main page structure and UI layout.
   * Contains the search bar, current-location button, weather cards, AQI panel, forecast section, and toast area.
2. ###### src/script.js

   * The app’s main JavaScript file.
   * Handles user actions like searching, location lookup, temperature toggling, and recent city clicks.
   * Updates the page with weather details, forecast cards, alerts, and background images.
3. ###### src/getWeatherInfo.js

   * The data orchestrator.
   * Calls the weather API helper and merges current weather, forecast, and AQI data into one response.
4. ###### src/getWeatherData.js

   * The API helper.
   * Builds OpenWeatherMap requests and performs fetch calls.
   * Handles current weather, location-based weather, AQI, and forecast requests.
5. ###### src/input.css` / `src/output.css

   * Tailwind CSS configuration and generated styles.
   * Provides the responsive layout and visual look for the page.
6. ###### src/images/

   * Background images for different weather conditions.
   * Icons for weather values, alerts, and UI controls.
7. ###### package.json

   * Lists the Tailwind CSS dependencies used in the project.



### Author

**Nazrul Hasan**



### Repository Link

[https://github.com/nazrul-hasan/Weather-Forecast-Application.git](https://github.com/nazrul-hasan/Weather-Forecast-Application.git)

