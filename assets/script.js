function getWeatherData() {
  const APIKEY = "0a8556dacfbf0be3914d5c5563991c23";
  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
  fetch(`${BASE_URL}?q=delhi&units=metric&appid=${APIKEY}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
}

getWeatherData();
