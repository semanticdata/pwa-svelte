import { mockWeatherData } from './mockWeatherData';

let OPENWEATHER_API_KEY = localStorage.getItem('openweather_api_key') || '';
let UNITS = localStorage.getItem('weather_units') || 'metric';
const STORAGE_KEY = 'weather_location';
const WEATHER_CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const USE_MOCK_DATA = import.meta.env.DEV && localStorage.getItem('use_mock_weather') === 'true';

class WeatherService {
    constructor() {
        this.location = this.getSavedLocation();
    }

    getApiKey() {
        return localStorage.getItem('openweather_api_key') || '';
    }

    getUnits() {
        return localStorage.getItem('weather_units') || 'metric';
    }

    setApiKey(apiKey) {
        OPENWEATHER_API_KEY = apiKey;
    }

    setUnits(units) {
        UNITS = units;
        localStorage.setItem('weather_units', units);
    }

    async searchLocation(query) {
        try {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error('API key not found. Please set your OpenWeather API key in settings.');
            }
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodedQuery}&limit=1&appid=${apiKey}`
            );
            if (!response.ok) {
                throw new Error(`Location search failed with status ${response.status}`);
            }
            const data = await response.json();
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            const location = {
                lat: data[0].lat,
                lon: data[0].lon
            };
            this.saveLocation(location);
            return location;
        } catch (error) {
            throw new Error(`Failed to search location: ${error.message}`);
        }
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            const useManualLocation = localStorage.getItem('use_manual_location') === 'true';
            const savedLocation = this.getSavedLocation();

            if (useManualLocation && savedLocation) {
                resolve(savedLocation);
                return;
            }

            if (!navigator.geolocation) {
                if (savedLocation) {
                    resolve(savedLocation);
                    return;
                }
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    this.saveLocation(location);
                    resolve(location);
                },
                (error) => {
                    if (savedLocation) {
                        resolve(savedLocation);
                        return;
                    }
                    reject(new Error(`Failed to get location: ${error.message}`));
                }
            );
        });
    }

    async getWeather(coords, forceRefresh = false) {
        if (USE_MOCK_DATA) {
            const mockResult = {
                ...mockWeatherData,
                isMock: true
            };
            this.cacheWeather(mockResult);
            return mockResult;
        }

        if (!forceRefresh) {
            const cachedData = this.getCachedWeather();
            if (cachedData) {
                return cachedData;
            }
        }

        try {
            const apiKey = this.getApiKey();
            const units = this.getUnits();

            if (!apiKey) {
                throw new Error('API key not found. Please set your OpenWeather API key in settings.');
            }

            // Get current weather (free tier)
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=${units}&appid=${apiKey}`
            );
            if (!currentResponse.ok) {
                if (currentResponse.status === 401) {
                    throw new Error('Invalid API key. Please ensure you have a valid OpenWeather API key.');
                }
                throw new Error(`Weather data fetch failed with status ${currentResponse.status}`);
            }
            const currentData = await currentResponse.json();

            // Get 5-day forecast (free tier)
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=${units}&appid=${apiKey}`
            );
            if (!forecastResponse.ok) {
                throw new Error(`Forecast data fetch failed with status ${forecastResponse.status}`);
            }
            const forecastData = await forecastResponse.json();

            const windSpeedUnit = units === 'imperial' ? 'mph' : 'm/s';
            const tempUnit = units === 'imperial' ? '°F' : '°C';
            const pressureUnit = 'hPa';

            // Get daily forecasts by filtering one reading per day at noon
            const dailyForecasts = forecastData.list
                .filter(item => item.dt_txt.includes('12:00:00'))
                .slice(0, 5)
                .map(day => ({
                    date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                    tempMax: Math.round(day.main.temp_max),
                    tempMin: Math.round(day.main.temp_min),
                    icon: day.weather[0].icon,
                    description: day.weather[0].description
                }));

            const current = {
                temperature: Math.round(currentData.main.temp),
                feelsLike: Math.round(currentData.main.feels_like),
                condition: currentData.weather[0].main,
                description: currentData.weather[0].description,
                icon: currentData.weather[0].icon,
                location: currentData.name,
                humidity: currentData.main.humidity,
                pressure: currentData.main.pressure,
                windSpeed: Math.round(currentData.wind.speed * 10) / 10,
                sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString(),
                sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString(),
                units: {
                    temp: tempUnit,
                    wind: windSpeedUnit,
                    pressure: pressureUnit
                },
                daily: dailyForecasts,
                isMock: false
            };

            this.cacheWeather(current);
            return current;
        } catch (error) {
            throw new Error(`Failed to fetch weather data: ${error.message}`);
        }
    }

    saveLocation(location) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    }

    getSavedLocation() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    }

    cacheWeather(weatherData) {
        const cache = {
            data: weatherData,
            timestamp: Date.now()
        };
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
    }

    getCachedWeather() {
        const cache = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!cache) return null;

        const { data, timestamp } = JSON.parse(cache);
        const now = Date.now();

        // Return null if cache is older than CACHE_DURATION
        if (now - timestamp > CACHE_DURATION) {
            localStorage.removeItem(WEATHER_CACHE_KEY);
            return null;
        }

        return data;
    }
}

export const weatherService = new WeatherService();