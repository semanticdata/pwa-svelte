<script lang="ts">
  import { onMount } from "svelte";
  import Weather from "./lib/Weather.svelte";
  import Settings from "./lib/Settings.svelte";
  import { widgetLayout, defaultLayout } from "./lib/stores/widgetStore";
  import type { Widget } from "./lib/stores/widgetStore";
  import { weatherService } from "./lib/weatherService";

  let timeString;
  let dateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let cityName = "";

  $: clockConfig =
    $widgetLayout?.widgets?.clock?.config ?? defaultLayout.widgets.clock.config;
  $: clockWidget = $widgetLayout?.widgets?.clock ?? defaultLayout.widgets.clock;
  $: weatherConfig =
    $widgetLayout?.widgets?.weather?.config ??
    defaultLayout.widgets.weather.config;
  $: weatherWidget =
    $widgetLayout?.widgets?.weather ?? defaultLayout.widgets.weather;
  $: grid = $widgetLayout?.grid ?? defaultLayout.grid;

  function updateTime() {
    const options = {
      hour: clockConfig?.show24Hour
        ? ("2-digit" as const)
        : ("numeric" as const),
      minute: "2-digit" as const,
      second: clockConfig?.showSeconds ? ("2-digit" as const) : undefined,
      hour12: !clockConfig?.show24Hour,
    };
    timeString = new Date().toLocaleTimeString("en-US", options);
  }

  onMount(() => {
    updateTime();
    const interval = setInterval(
      updateTime,
      clockConfig?.showSeconds ? 1000 : 60000,
    );

    if (clockConfig?.showLocation) {
      (async () => {
        const location = weatherService.getSavedLocation();
        if (location) {
          const weather = await weatherService.getWeather();
          cityName = weather.name;
        }
      })();
    }

    return () => clearInterval(interval);
  });

  const sizeClasses = {
    sm: "col-span-1 row-span-1",
    md: "col-span-2 row-span-2",
    lg: "col-span-4 row-span-2",
  };
</script>

<main
  class="h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 select-none overflow-hidden"
>
  <div class="grid grid-cols-4 gap-4 auto-rows-min h-full">
    {#if clockWidget?.enabled}
      <div
        class={`${sizeClasses[clockWidget.size]}`}
        style="order: {clockWidget.order}"
      >
        <div class="hero bg-white dark:bg-gray-800 rounded-box h-full">
          <div class="hero-content text-center">
            <div>
              <h1
                class="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 tracking-tight"
              >
                {timeString}
              </h1>
              <p class="text-xl md:text-2xl lg:text-3xl font-normal opacity-80">
                {dateString}
              </p>
              {#if clockConfig.showLocation && cityName}
                <p
                  class="text-lg md:text-xl lg:text-2xl font-normal opacity-60 mt-2"
                >
                  {cityName}
                </p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if weatherWidget?.enabled}
      <div
        class={`${sizeClasses[weatherWidget.size]}`}
        style="order: {weatherWidget.order}"
      >
        <Weather />
      </div>
    {/if}
  </div>
  <Settings />
</main>
