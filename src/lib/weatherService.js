const OPENWEATHER_API_KEY = 'YOUR_API_KEY';
const STORAGE_KEY = 'weather_location';
const WEATHER_CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

class WeatherService {
    constructor() {
        this.location = this.getSavedLocation();
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
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
                    reject(new Error(`Failed to get location: ${error.message}`));
                }
            );
        });
    }

    async getWeather(coords, forceRefresh = false) {
        // Check cache first if not forcing refresh
        if (!forceRefresh) {
            const cachedData = this.getCachedWeather();
            if (cachedData) {
                return cachedData;
            }
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
            );
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please ensure you have a valid OpenWeather API key.');
                }
                throw new Error(`Weather data fetch failed with status ${response.status}`);
            }
            const data = await response.json();
            return {
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                location: data.name,
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 10) / 10
            };

            // Cache the weather data
            this.cacheWeather(data);
            return data;
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