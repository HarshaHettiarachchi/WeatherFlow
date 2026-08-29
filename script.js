const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle");
const clearRecentBtn = document.getElementById("clearRecentBtn");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const weatherSection = document.getElementById("weatherSection");

let weatherData = null;
let currentUnit = "celsius";
let recentCities = [];


/* =========================
   WEATHER INFORMATION
========================= */

function getWeatherInfo(code) {

  const weatherCodes = {

    0: {
      description: "Clear Sky",
      icon: "☀️"
    },

    1: {
      description: "Mainly Clear",
      icon: "🌤️"
    },

    2: {
      description: "Partly Cloudy",
      icon: "⛅"
    },

    3: {
      description: "Cloudy",
      icon: "☁️"
    },

    45: {
      description: "Foggy",
      icon: "🌫️"
    },

    48: {
      description: "Foggy",
      icon: "🌫️"
    },

    51: {
      description: "Light Drizzle",
      icon: "🌦️"
    },

    53: {
      description: "Drizzle",
      icon: "🌦️"
    },

    55: {
      description: "Heavy Drizzle",
      icon: "🌧️"
    },

    56: {
      description: "Freezing Drizzle",
      icon: "🌧️"
    },

    57: {
      description: "Heavy Freezing Drizzle",
      icon: "🌧️"
    },

    61: {
      description: "Light Rain",
      icon: "🌦️"
    },

    63: {
      description: "Rain",
      icon: "🌧️"
    },

    65: {
      description: "Heavy Rain",
      icon: "🌧️"
    },

    66: {
      description: "Freezing Rain",
      icon: "🌧️"
    },

    67: {
      description: "Heavy Freezing Rain",
      icon: "🌧️"
    },

    71: {
      description: "Light Snow",
      icon: "🌨️"
    },

    73: {
      description: "Snow",
      icon: "❄️"
    },

    75: {
      description: "Heavy Snow",
      icon: "❄️"
    },

    77: {
      description: "Snow Grains",
      icon: "❄️"
    },

    80: {
      description: "Light Rain Showers",
      icon: "🌦️"
    },

    81: {
      description: "Rain Showers",
      icon: "🌧️"
    },

    82: {
      description: "Heavy Rain Showers",
      icon: "⛈️"
    },

    85: {
      description: "Snow Showers",
      icon: "🌨️"
    },

    86: {
      description: "Heavy Snow Showers",
      icon: "❄️"
    },

    95: {
      description: "Thunderstorm",
      icon: "⛈️"
    },

    96: {
      description: "Thunderstorm with Hail",
      icon: "⛈️"
    },

    99: {
      description: "Heavy Thunderstorm",
      icon: "⛈️"
    }

  };

  return weatherCodes[code] || {
    description: "Unknown",
    icon: "🌤️"
  };

}


/* =========================
   LOADING
========================= */

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}


/* =========================
   ERROR
========================= */

function showError(message) {

  errorMessage.querySelector("p").textContent = message;

  errorMessage.classList.remove("hidden");

}

function hideError() {
  errorMessage.classList.add("hidden");
}


/* =========================
   GET CITY COORDINATES
========================= */

async function getCoordinates(city) {

  const url =
    `https://geocoding-api.open-meteo.com/v1/search?` +
    `name=${encodeURIComponent(city)}` +
    `&count=1&language=en&format=json`;


  const response = await fetch(url);


  if (!response.ok) {
    throw new Error("City not found.");
  }


  const data = await response.json();


  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Please try again.");
  }


  return data.results[0];

}


/* =========================
   LOCATION IMAGE
========================= */

async function getLocationImage(city, country) {

  try {

    // Remove old image first
    weatherSection.style.setProperty(
      "--location-image",
      "none"
    );


    const searchUrl =
      `https://en.wikipedia.org/w/api.php?` +
      `action=query` +
      `&generator=search` +
      `&gsrsearch=${encodeURIComponent(city)}` +
      `&gsrlimit=1` +
      `&prop=pageimages` +
      `&piprop=original|thumbnail` +
      `&pithumbsize=1600` +
      `&format=json` +
      `&origin=*`;


    const response = await fetch(searchUrl);


    if (!response.ok) {
      throw new Error("Image search failed");
    }


    const data = await response.json();


    const pages = data.query?.pages;


    if (pages) {

      const page = Object.values(pages)[0];


      let imageUrl = null;


      if (page.original?.source) {

        imageUrl = page.original.source;

      }

      else if (page.thumbnail?.source) {

        imageUrl = page.thumbnail.source;

      }


      if (imageUrl) {

        weatherSection.style.setProperty(
          "--location-image",
          `url("${imageUrl}")`
        );

        return;

      }

    }


    setFallbackLocationImage(city, country);

  }

  catch (error) {

    console.log("Location image unavailable");

    setFallbackLocationImage(city, country);

  }

}


/* =========================
   FALLBACK IMAGE
========================= */

function setFallbackLocationImage(city, country = "") {

  const timestamp = Date.now();


  const imageUrl =
    `https://loremflickr.com/1600/900/` +
    `city,landscape,travel?` +
    `lock=${timestamp}`;


  weatherSection.style.setProperty(
    "--location-image",
    `url("${imageUrl}")`
  );

}


/* =========================
   GET WEATHER
========================= */

async function getWeather(city) {

  try {

    showLoading();
    hideError();


    const location =
      await getCoordinates(city);


    const {
      latitude,
      longitude,
      name,
      country
    } = location;


    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}` +
      `&longitude=${longitude}` +

      `&current=` +
      `temperature_2m,` +
      `relative_humidity_2m,` +
      `weather_code,` +
      `wind_speed_10m` +

      `&daily=` +
      `weather_code,` +
      `temperature_2m_max,` +
      `temperature_2m_min,` +
      `sunrise,` +
      `sunset` +

      `&timezone=auto`;


    const response =
      await fetch(weatherUrl);


    if (!response.ok) {

      throw new Error(
        "Unable to get weather data."
      );

    }


    const data =
      await response.json();


    weatherData = data;

    currentUnit = "celsius";


    displayWeather(
      data,
      name,
      country
    );


    // CHANGE LOCATION IMAGE
    getLocationImage(
      name,
      country
    );


    addRecentCity(name);


    cityInput.value = "";

  }

  catch (error) {

    console.error(error);

    showError(error.message);

  }

  finally {

    hideLoading();

  }

}


/* =========================
   DISPLAY WEATHER
========================= */

function displayWeather(data, city, country) {

  const current = data.current;


  const weatherInfo =
    getWeatherInfo(
      current.weather_code
    );


  changeWeatherBackground(
    current.weather_code
  );


  document.getElementById("cityName").textContent =
    country
      ? `${city}, ${country}`
      : city;


  document.getElementById("temperature").textContent =
    `${Math.round(
      current.temperature_2m
    )}°C`;


  document.getElementById("weatherCondition").textContent =
    weatherInfo.description;


  document.getElementById("weatherEmoji").textContent =
    weatherInfo.icon;


  document.getElementById("humidity").textContent =
    `${current.relative_humidity_2m}%`;


  document.getElementById("windSpeed").textContent =
    `${Math.round(
      current.wind_speed_10m
    )} km/h`;


  if (data.daily.sunrise?.[0]) {

    document.getElementById("sunrise").textContent =
      formatTime(
        data.daily.sunrise[0]
      );

  }


  if (data.daily.sunset?.[0]) {

    document.getElementById("sunset").textContent =
      formatTime(
        data.daily.sunset[0]
      );

  }


  updateDateTime(
    data.timezone
  );


  displayForecast(
    data.daily
  );

}


/* =========================
   FORMAT TIME
========================= */

function formatTime(dateString) {

  if (!dateString) {
    return "--:--";
  }


  const time =
    dateString.split("T")[1];


  if (!time) {
    return "--:--";
  }


  return new Date(
    `2000-01-01T${time}`
  ).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }
  );

}


/* =========================
   5 DAY FORECAST
========================= */

function displayForecast(daily) {

  const container =
    document.getElementById(
      "forecastContainer"
    );


  container.innerHTML = "";


  for (let i = 1; i <= 5; i++) {

    if (!daily.time[i]) {
      continue;
    }


    const date =
      new Date(
        `${daily.time[i]}T12:00:00`
      );


    const weatherInfo =
      getWeatherInfo(
        daily.weather_code[i]
      );


    const day =
      date.toLocaleDateString(
        "en-US",
        {
          weekday: "short"
        }
      );


    const maxTemp =
      Math.round(
        daily.temperature_2m_max[i]
      );


    const minTemp =
      Math.round(
        daily.temperature_2m_min[i]
      );


    const card =
      document.createElement("div");


    card.className =
      "forecast-card";


    card.innerHTML = `
      <h3>${day}</h3>

      <div class="forecast-icon">
        ${weatherInfo.icon}
      </div>

      <p>
        ${weatherInfo.description}
      </p>

      <strong>
        ${maxTemp}° / ${minTemp}°
      </strong>
    `;


    container.appendChild(card);

  }

}


/* =========================
   LOCAL DATE AND TIME
========================= */

function updateDateTime(timezone) {

  const now = new Date();


  const formattedDate =
    now.toLocaleString(
      "en-US",
      {

        timeZone: timezone,

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit"

      }
    );


  document.getElementById("dateTime").textContent =
    formattedDate;

}


/* =========================
   WEATHER BACKGROUND
========================= */

function changeWeatherBackground(code) {

  const body = document.body;


  body.classList.remove(

    "weather-clear",
    "weather-cloudy",
    "weather-rain",
    "weather-snow",
    "weather-storm"

  );


  if (
    code === 0 ||
    code === 1
  ) {

    body.classList.add(
      "weather-clear"
    );

  }

  else if (

    code === 2 ||
    code === 3 ||
    code === 45 ||
    code === 48

  ) {

    body.classList.add(
      "weather-cloudy"
    );

  }

  else if (

    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82)

  ) {

    body.classList.add(
      "weather-rain"
    );

  }

  else if (

    (code >= 71 && code <= 77) ||
    (code >= 85 && code <= 86)

  ) {

    body.classList.add(
      "weather-snow"
    );

  }

  else if (code >= 95) {

    body.classList.add(
      "weather-storm"
    );

  }

}


/* =========================
   SEARCH BUTTON
========================= */

searchBtn.addEventListener(
  "click",
  () => {

    const city =
      cityInput.value.trim();


    if (!city) {

      showError(
        "Please enter a city name."
      );

      return;

    }


    getWeather(city);

  }
);


/* =========================
   ENTER KEY
========================= */

cityInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      event.preventDefault();


      const city =
        cityInput.value.trim();


      if (!city) {

        showError(
          "Please enter a city name."
        );

        return;

      }


      getWeather(city);

    }

  }
);


/* =========================
   DARK MODE
========================= */

themeToggle.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "dark"
    );


    const icon =
      themeToggle.querySelector("i");


    if (
      document.body.classList.contains(
        "dark"
      )
    ) {

      icon.className =
        "fa-solid fa-sun";

    }

    else {

      icon.className =
        "fa-solid fa-moon";

    }

  }
);


/* =========================
   TEMPERATURE UNIT
========================= */

unitToggle.addEventListener(
  "click",
  () => {

    if (!weatherData) {
      return;
    }


    const temperature =
      weatherData.current.temperature_2m;


    const temperatureElement =
      document.getElementById(
        "temperature"
      );


    if (
      currentUnit === "celsius"
    ) {

      const fahrenheit =
        (temperature * 9 / 5) + 32;


      temperatureElement.textContent =
        `${Math.round(
          fahrenheit
        )}°F`;


      currentUnit =
        "fahrenheit";

    }

    else {

      temperatureElement.textContent =
        `${Math.round(
          temperature
        )}°C`;


      currentUnit =
        "celsius";

    }

  }
);


/* =========================
   RECENT CITIES
========================= */

function addRecentCity(city) {

  recentCities =
    recentCities.filter(

      item =>
        item.toLowerCase() !==
        city.toLowerCase()

    );


  recentCities.unshift(city);


  recentCities =
    recentCities.slice(0, 5);


  displayRecentCities();

}


function displayRecentCities() {

  const container =
    document.getElementById(
      "recentCities"
    );


  container.innerHTML = "";


  if (
    recentCities.length === 0
  ) {

    container.innerHTML = `
      <p class="empty-recent">
        No recent searches yet.
      </p>
    `;

    return;

  }


  recentCities.forEach(
    city => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "recent-city";


      button.innerHTML = `
        <i class="fa-solid fa-location-dot"></i>
        ${city}
      `;


      button.addEventListener(
        "click",
        () => {

          getWeather(city);

        }
      );


      container.appendChild(button);

    }
  );

}


/* =========================
   CLEAR RECENT SEARCHES
========================= */

clearRecentBtn.addEventListener(
  "click",
  () => {

    recentCities = [];

    displayRecentCities();

  }
);


/* =========================
   CURRENT LOCATION
========================= */

locationBtn.addEventListener(
  "click",
  () => {

    if (!navigator.geolocation) {

      showError(
        "Geolocation is not supported by your browser."
      );

      return;

    }


    showLoading();
    hideError();


    navigator.geolocation.getCurrentPosition(

      async position => {

        try {

          const latitude =
            position.coords.latitude;


          const longitude =
            position.coords.longitude;


          const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?` +

            `latitude=${latitude}` +

            `&longitude=${longitude}` +

            `&current=` +
            `temperature_2m,` +
            `relative_humidity_2m,` +
            `weather_code,` +
            `wind_speed_10m` +

            `&daily=` +
            `weather_code,` +
            `temperature_2m_max,` +
            `temperature_2m_min,` +
            `sunrise,` +
            `sunset` +

            `&timezone=auto`;


          const response =
            await fetch(weatherUrl);


          if (!response.ok) {

            throw new Error(
              "Unable to get weather data."
            );

          }


          const data =
            await response.json();


          weatherData = data;

          currentUnit = "celsius";


          displayWeather(
            data,
            "Current Location",
            ""
          );


          setFallbackLocationImage(
            "Current Location"
          );

        }

        catch (error) {

          console.error(error);


          showError(
            "Unable to get weather for your location."
          );

        }

        finally {

          hideLoading();

        }

      },


      () => {

        hideLoading();


        showError(
          "Unable to access your location."
        );

      }

    );

  }
);


/* =========================
   DEFAULT CITY
========================= */

getWeather("Kyoto");