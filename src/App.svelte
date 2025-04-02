<script>
  import { onMount } from 'svelte';
  import { weatherService } from './lib/weatherService';

  let currentDate = new Date();
  let timeString = "";
  let dateString = "";
  let weather = null;
  let error = null;
  let loading = true;

  function updateDateTime() {
    currentDate = new Date();
    timeString = currentDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    dateString = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async function loadWeather() {
    try {
      loading = true;
      error = null;
      const coords = await weatherService.getCurrentPosition();
      weather = await weatherService.getWeather(coords);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadWeather();
    // Refresh weather every 10 minutes
    const weatherInterval = setInterval(loadWeather, 600000);
    return () => clearInterval(weatherInterval);
  });

  setInterval(updateDateTime, 1000);
  updateDateTime();
</script>

<main
  class="flex flex-col justify-center items-center min-h-screen bg-black text-white font-sans p-5 md:p-10 text-center select-none antialiased"
>
  <div class="mb-8 md:mb-12">
    <div class="text-[clamp(3rem,15vw,8rem)] font-bold mb-4 -tracking-[1px]">
      {timeString}
    </div>
    <div class="text-[clamp(1.5rem,5vw,2.5rem)] font-normal opacity-90">
      {dateString}
    </div>
  </div>
  <div
    class="w-full max-w-[600px] bg-white/10 rounded-2xl p-8 backdrop-blur-lg"
  >
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
</main>
