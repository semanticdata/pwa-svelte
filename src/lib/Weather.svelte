<script>
    import { onMount } from "svelte";
    import { weatherService } from "./weatherService";

    let weather = null;
    let loading = true;
    let error = null;
    let lastUpdate = null;

    async function loadWeather(forceRefresh = false) {
        loading = true;
        error = null;
        try {
            const position = await weatherService.getCurrentPosition();
            weather = await weatherService.getWeather(position, forceRefresh);
            lastUpdate = new Date();
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function formatLastUpdate() {
        if (!lastUpdate) return "";
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000); // difference in seconds

        if (diff < 60) return "Updated just now";
        if (diff < 3600) return `Updated ${Math.floor(diff / 60)} minutes ago`;
        return `Updated at ${lastUpdate.toLocaleTimeString()}`;
    }

    onMount(() => {
        loadWeather();
    });
</script>

<div
    class="card w-full h-full bg-white dark:bg-gray-800 shadow-xl backdrop-blur-lg"
>
    <div class="card-body h-full overflow-y-auto p-4">
        <h2
            class="card-title text-2xl mb-2 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10"
        >
            Weather
        </h2>
        <div class="text-base">
            {#if loading}
                <div class="flex justify-center">
                    <span class="loading loading-spinner loading-lg"></span>
                </div>
            {:else if error}
                <div class="alert alert-error">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        /></svg
                    >
                    <span>{error}</span>
                </div>
            {:else if weather}
                <div class="flex flex-col gap-2">
                    <div
                        class="stats stats-compact bg-gray-100 dark:bg-gray-700 shadow"
                    >
                        <div class="stat py-2">
                            <div class="stat-figure text-secondary">
                                <img
                                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                                    alt={weather.description}
                                    class="w-12 h-12"
                                />
                            </div>
                            <div class="stat-title text-sm capitalize">
                                {weather.description}
                            </div>
                            <div class="stat-value text-2xl">
                                {weather.temperature}{weather.units.temp}
                            </div>
                            <div class="stat-desc text-sm">
                                {weather.location}
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                        <div class="stat bg-base-300 shadow rounded-box p-2">
                            <div class="stat-title text-xs">Feels Like</div>
                            <div class="stat-value text-xl">
                                {weather.feelsLike}{weather.units.temp}
                            </div>
                        </div>
                        <div class="stat bg-base-300 shadow rounded-box p-2">
                            <div class="stat-title text-xs">Humidity</div>
                            <div class="stat-value text-xl">
                                {weather.humidity}%
                            </div>
                        </div>
                        <div class="stat bg-base-300 shadow rounded-box p-2">
                            <div class="stat-title text-xs">Pressure</div>
                            <div class="stat-value text-xl">
                                {weather.pressure}
                            </div>
                            <div class="stat-desc text-xs">
                                {weather.units.pressure}
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div class="stat bg-base-300 shadow rounded-box p-2">
                            <div class="stat-title text-xs">Wind Speed</div>
                            <div class="stat-value text-xl">
                                {weather.windSpeed}
                                <span class="text-sm">{weather.units.wind}</span
                                >
                            </div>
                        </div>
                        <div class="stat bg-base-300 shadow rounded-box p-2">
                            <div class="stat-title text-xs">Sun Times</div>
                            <div class="stat-desc text-sm">
                                🌅 {weather.sunrise}
                                <br />
                                🌇 {weather.sunset}
                            </div>
                        </div>
                    </div>

                    <div class="divider my-1 text-sm">5-Day Forecast</div>

                    <div class="grid grid-cols-5 gap-1">
                        {#each weather.daily as day}
                            <div
                                class="stat bg-base-300 shadow rounded-box p-2"
                            >
                                <div class="stat-title text-xs text-center">
                                    {day.date}
                                </div>
                                <div class="flex justify-center">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                                        alt={day.description}
                                        class="w-8 h-8"
                                    />
                                </div>
                                <div class="stat-value text-center text-base">
                                    {day.tempMax}°
                                    <span class="text-sm opacity-60"
                                        >/{day.tempMin}°</span
                                    >
                                </div>
                            </div>
                        {/each}
                    </div>

                    <div class="flex flex-col items-center gap-2 mt-2">
                        <button
                            on:click={() => loadWeather(true)}
                            class="btn btn-circle bg-blue-500 hover:bg-blue-600 text-white"
                            title="Refresh weather data"
                            aria-label="Refresh weather data"
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                        {#if lastUpdate}
                            <span class="text-sm opacity-75"
                                >{formatLastUpdate()}</span
                            >
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
