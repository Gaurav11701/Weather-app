import React, { useState } from "react";
import images from "./images.json";

// function to map weather codes to icons
function getWeatherIcon(code) {
  if (code === 0) return images.clear;
  if (code >= 1 && code <= 3) return images.clouds;
  if (code === 45 || code === 48) return images.mist;
  if (code >= 51 && code <= 57) return images.drizzle;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return images.rain;
  if (code >= 71 && code <= 77) return images.snow;
  if (code >= 95) return images.rain;
  return images.clouds;
}

// Main Weather Component
export default function Weather() {
  // State variables
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch weather data
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);
    // Fetch coordinates from city name
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
      const geoRes = await fetch(geoUrl);

      // Handle errors
      if (!geoRes.ok) throw new Error("Failed to fetch city coordinates");
      const geoData = await geoRes.json();

      // Check if city is found
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }
      // Extract latitude and longitude
      const { latitude, longitude, name, country } = geoData.results[0];

      // Fetch weather data using coordinates
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      const weatherRes = await fetch(weatherUrl);

      // Handle errors
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const weatherData = await weatherRes.json();
      // Update weather state
      setWeather({
        ...weatherData.current_weather,

        // Add city name to weather data
        location: `${name}, ${country}`,
      });
    } catch (err) {
      // Catch and set error messages
      setError(err.message);
    } finally {
      // Set loading to false after fetch attempt
      setLoading(false);
    }
  };
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    fetchWeather();
  };

  return (
    <div className="min-h-screen w-full bg-gray-800 flex justify-center items-center">
      <div className="w-[470px] bg-gray-600 rounded-3xl p-10 text-center text-white shadow-xl">
        {/* Search Box */}
        <form
          onSubmit={handleSubmit}
          className="search-bar w-full flex justify-between items-center mb-6"
        >
          <input
            className="h-14 rounded-full border-none outline-none p-4 text-xl bg-white text-neutral-900 flex-1 mr-4"
            type="text"
            placeholder="Enter City Name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="submit"
            className="bg-white p-3 rounded-full border-none outline-none cursor-pointer w-14 h-14 flex items-center justify-center"
          >
            <img src={images.search} alt="search" className="w-6" />
          </button>
        </form>

        {/* Loading & Error */}
        {loading && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-gray-800"></div>
            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-gray-800"></div>
            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-gray-800"></div>
          </div>
        )}
        {error && <p className="text-white text-2xl font-bold">{error}</p>}

        {/* Weather Display */}
        {weather && (
          <div className="weather">
            {/* Weather Icon changes dynamically */}
            <img
              src={getWeatherIcon(weather.weathercode)}
              alt="weather-icon"
              className="weather-icon mt-8 mx-auto w-[170px]"
            />

            {/* Temperature */}
            <h1 className="temp text-7xl font-bold mt-4">
              {weather.temperature}°C
            </h1>

            {/* City */}
            <h2 className="city text-4xl font-medium mt-2">
              {weather.location}
            </h2>

            {/* Weather Details */}
            <div className="details flex justify-between items-center mt-10 px-5">
              {/* Humidity (static placeholder) */}
              <div className="col flex items-center text-left">
                <img src={images.humid} alt="humidity" className="w-10 mr-3" />
                <div>
                  <p className="humidity text-2xl font-semibold">50%</p>
                  <p className="text-sm text-gray-200">Humidity</p>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="col flex items-center text-left">
                <img src={images.wind} alt="wind" className="w-10 mr-3" />
                <div>
                  <p className="wind text-2xl font-semibold">
                    {weather.windspeed} km/h
                  </p>
                  <p className="text-sm text-gray-200">Wind Speed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
