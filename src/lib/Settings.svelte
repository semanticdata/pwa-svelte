<script>
    import { onMount } from "svelte";
    import { weatherService } from "./weatherService";

    let showModal = false;
    let apiKey = "";
    let units = "metric";
    let useManualLocation = false;
    let latitude = "";
    let longitude = "";
    let locationSearch = "";
    let searchError = "";

    onMount(() => {
        apiKey = localStorage.getItem("openweather_api_key") || "";
        units = localStorage.getItem("weather_units") || "metric";
        useManualLocation = localStorage.getItem("use_manual_location") === "true";
        const savedLocation = weatherService.getSavedLocation();
        if (savedLocation) {
            latitude = savedLocation.lat.toString();
            longitude = savedLocation.lon.toString();
        }
    });

    async function validateApiKey(key) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${key}`
            );
            if (response.status === 401) {
                throw new Error("Invalid API key. Please check your OpenWeather API key.");
            }
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function searchByLocation() {
        try {
            searchError = "";
            if (!apiKey) {
                throw new Error("Please enter your OpenWeather API key first.");
            }
            const location = await weatherService.searchLocation(locationSearch);
            latitude = location.lat.toString();
            longitude = location.lon.toString();
        } catch (error) {
            searchError = error.message;
        }
    }

    async function saveSettings() {
        try {
            searchError = "";
            if (apiKey) {
                await validateApiKey(apiKey);
            }
            
            localStorage.setItem("openweather_api_key", apiKey);
            localStorage.setItem("weather_units", units);
            localStorage.setItem("use_manual_location", useManualLocation.toString());
            weatherService.setApiKey(apiKey);
            weatherService.setUnits(units);

            if (useManualLocation && latitude && longitude) {
                weatherService.saveLocation({
                    lat: parseFloat(latitude),
                    lon: parseFloat(longitude)
                });
            }
            showModal = false;
        } catch (error) {
            searchError = error.message;
        }
    }
</script>

<div class="fixed bottom-4 right-4">
    <button
        class="btn btn-circle btn-primary"
        on:click={() => (showModal = true)}
        aria-label="Open settings"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    </button>
</div>

{#if showModal}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Settings</h3>
            <div class="form-control w-full">
                <label class="label" for="apiKey">
                    <span class="label-text">OpenWeather API Key</span>
                </label>
                <input
                    type="password"
                    id="apiKey"
                    placeholder="Enter your API key"
                    class="input input-bordered w-full"
                    bind:value={apiKey}
                />
                <label class="label" for="apiKeyHelp"></label>
                <label for="apiKeyHelp" class="label-text-alt"
                    >Get your API key from <a
                        href="https://openweathermap.org/api"
                        target="_blank"
                        class="link">OpenWeather</a
                    ></label
                >
                <span id="apiKeyHelp" class="sr-only"
                    >Link to OpenWeather API documentation</span
                >
            </div>
            <div class="form-control w-full mt-4">
                <label class="label" for="units">
                    <span class="label-text">Temperature Units</span>
                </label>
                <select
                    id="units"
                    class="select select-bordered w-full"
                    bind:value={units}
                >
                    <option value="metric">Metric (°C, m/s)</option>
                    <option value="imperial">Imperial (°F, mph)</option>
                </select>
            </div>

            <div class="form-control w-full mt-4">
                <label class="label cursor-pointer">
                    <span class="label-text">Use Manual Location</span>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary"
                        bind:checked={useManualLocation}
                    />
                </label>
            </div>

            {#if useManualLocation}
                <div class="form-control w-full mt-4">
                    <label class="label">
                        <span class="label-text">Search Location</span>
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter city name or zip code"
                            class="input input-bordered flex-1"
                            bind:value={locationSearch}
                            disabled={!useManualLocation}
                        />
                        <button
                            class="btn btn-primary"
                            on:click={searchByLocation}
                            disabled={!useManualLocation || !locationSearch}
                        >
                            Search
                        </button>
                    </div>
                    {#if searchError}
                        <label class="label">
                            <span class="label-text-alt text-error">{searchError}</span>
                        </label>
                    {/if}
                </div>
                <div class="form-control w-full mt-4">
                    <label class="label">
                        <span class="label-text">Coordinates (auto-filled from search)</span>
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Latitude"
                            class="input input-bordered"
                            bind:value={latitude}
                            disabled
                        />
                        <input
                            type="text"
                            placeholder="Longitude"
                            class="input input-bordered"
                            bind:value={longitude}
                            disabled
                        />
                    </div>
                </div>
            {/if}
            <div class="modal-action">
                <button class="btn" on:click={() => (showModal = false)}
                    >Cancel</button
                >
                <button class="btn btn-primary" on:click={saveSettings}
                    >Save</button
                >
            </div>
        </div>
    </div>
{/if}
