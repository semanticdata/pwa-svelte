<script>
  import { onMount } from 'svelte';
  import { weatherService } from './weatherService';

  let weather = null;
  let loading = true;
  let error = null;

  async function loadWeather() {
    loading = true;
    error = null;
    try {
      const position = await weatherService.getCurrentPosition();
      weather = await weatherService.getWeather(position);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadWeather();
  });
</script>

<div class="w-full max-w-[600px] bg-white/10 rounded-2xl p-8 backdrop-blur-lg">
  <h2 class="text-[clamp(1.5rem,4vw,2rem)] font-semibold mb-4 text-white/95">
    Weather
  </h2>
  <div class="text-[clamp(1rem,3vw,1.25rem)] opacity-90">
    {#if loading}
      <p class="animate-pulse">Loading weather information...</p>
    {:else if error}
      <p class="text-red-400">{error}</p>
    {:else if weather}
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-center gap-4">
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            class="w-16 h-16"
          />
          <div class="text-4xl font-bold">{weather.temperature}°C</div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="capitalize">{weather.description}</p>
          <p class="text-white/70">{weather.location}</p>
          <div class="grid grid-cols-2 gap-4 mt-2">
            <div class="flex items-center gap-2">
              <span class="text-white/70">Humidity:</span>
              <span>{weather.humidity}%</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-white/70">Wind:</span>
              <span>{weather.windSpeed} m/s</span>
            </div>
          </div>
        </div>
        <button
          on:click={loadWeather}
          class="mt-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
        >
          Refresh
        </button>
      </div>
    {/if}
  </div>
</div>