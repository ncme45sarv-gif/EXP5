
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const status = document.getElementById("status");
const weatherResult = document.getElementById("weatherResult");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const weatherIcon = document.getElementById("weatherIcon");
const condition = document.getElementById("condition");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const updatedTime = document.getElementById("updatedTime");

function getWeatherDescription(code) {
    const weatherTypes = {
        0: ["Clear sky", "☀️"],
        1: ["Mainly clear", "🌤️"],
        2: ["Partly cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Fog", "🌫️"],
        48: ["Depositing rime fog", "🌫️"],
        51: ["Light drizzle", "🌦️"],
        53: ["Moderate drizzle", "🌦️"],
        55: ["Dense drizzle", "🌧️"],
        61: ["Slight rain", "🌧️"],
        63: ["Moderate rain", "🌧️"],
        65: ["Heavy rain", "🌧️"],
        71: ["Slight snowfall", "🌨️"],
        73: ["Moderate snowfall", "🌨️"],
        75: ["Heavy snowfall", "❄️"],
        80: ["Rain showers", "🌦️"],
        81: ["Moderate rain showers", "🌧️"],
        82: ["Heavy rain showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with hail", "⛈️"],
        99: ["Thunderstorm with heavy hail", "⛈️"]
    };

    return weatherTypes[code] || ["Unknown conditions", "🌡️"];
}

async function getWeather(city) {
    searchButton.disabled = true;
    searchButton.textContent = "Loading...";
    status.textContent = "Finding city and fetching weather...";
    weatherResult.hidden = true;

    try {
        // Step 1: Find the city's coordinates.
        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Could not search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling.");
        }

        const place = geoData.results[0];

        // Step 2: Fetch the current weather.
        const weatherURL =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + place.latitude +
            "&longitude=" + place.longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        if (!current) {
            throw new Error("Weather data is unavailable.");
        }

        // Step 3: Display the weather.
        const weatherInfo = getWeatherDescription(
            current.weather_code
        );

        cityName.textContent = place.name;
        countryName.textContent =
            [place.admin1, place.country]
                .filter(Boolean)
                .join(", ");

        weatherIcon.textContent = weatherInfo[1];
        condition.textContent = weatherInfo[0];

        temperature.textContent =
            Math.round(current.temperature_2m);

        feelsLike.textContent =
            "Feels like " +
            Math.round(current.apparent_temperature) +
            "°C";

        humidity.textContent =
            current.relative_humidity_2m;

        wind.textContent =
            Math.round(current.wind_speed_10m);

        updatedTime.textContent =
            "Local weather time: " +
            current.time.replace("T", " ");

        weatherResult.hidden = false;
        status.textContent = "Weather loaded successfully!";

    } catch (error) {
        status.textContent =
            error.message ||
            "Something went wrong. Please try again.";
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        status.textContent = "Please enter a city name.";
        cityInput.focus();
        return;
    }

    getWeather(city);
});
