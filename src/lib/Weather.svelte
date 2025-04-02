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

<div class="card w-full max-w-[600px] bg-base-200 shadow-xl backdrop-blur-lg">
    <div class="card-body">
        <h2 class="card-title text-[clamp(1.5rem,4vw,2rem)] mb-4">Weather</h2>
        <div class="text-[clamp(1rem,3vw,1.25rem)]">
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
                <div class="flex flex-col gap-4">
                    <div class="stats bg-base-300 shadow">
                        <div class="stat">
                            <div class="stat-figure text-secondary">
                                <img
                                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                                    alt={weather.description}
                                    class="w-16 h-16"
                                />
                            </div>
                            <div class="stat-title capitalize">
                                {weather.description}
                            </div>
                            <div class="stat-value text-4xl">
                                {weather.temperature}°C
                            </div>
                            <div class="stat-desc">{weather.location}</div>
                        </div>
                    </div>

                    <div class="stats bg-base-300 shadow">
                        <div class="stat">
                            <div class="stat-title">Humidity</div>
                            <div class="stat-value">{weather.humidity}%</div>
                        </div>
                        <div class="stat">
                            <div class="stat-title">Wind Speed</div>
                            <div class="stat-value">
                                {weather.windSpeed} m/s
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col items-center gap-2 mt-2">
                        <button
                            on:click={() => loadWeather(true)}
                            class="btn btn-circle btn-primary"
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
