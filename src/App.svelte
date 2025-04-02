<script lang="ts">
  import { onMount } from "svelte";
  import Weather from "./lib/Weather.svelte";
  import Settings from "./lib/Settings.svelte";
  import TickTick from "./lib/TickTick.svelte";
  import { widgetLayout, defaultLayout } from "./lib/stores/widgetStore";
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
  $: tickTickWidget = $widgetLayout?.widgets?.ticktick ?? defaultLayout.widgets.ticktick;
  $: grid = $widgetLayout?.grid ?? defaultLayout.grid;

  function updateTime() {
    const options = {
      hour: clockConfig?.show24Hour ? "2-digit" : "numeric",
      minute: "2-digit",
      second: clockConfig?.showSeconds ? "2-digit" : undefined,
      hour12: !clockConfig?.show24Hour,
    } as const;
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

  $: gridStyle = `
    grid-template-columns: repeat(${grid.columns}, minmax(0, 1fr));
    grid-template-rows: repeat(${grid.rows}, minmax(0, auto));
    gap: ${grid.gap}rem;
    grid-auto-flow: ${grid.direction === "vertical" ? "column" : "row"};
  `;
</script>

<main
  class="h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 select-none overflow-hidden"
>
  <div class="grid auto-rows-min h-full" style={gridStyle}>
    {#if clockWidget?.enabled}
      <div
        class="col-span-{clockWidget.size.w} row-span-{clockWidget.size.h}"
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
        class="col-span-{weatherWidget.size.w} row-span-{weatherWidget.size.h}"
        style="order: {weatherWidget.order}"
      >
        <Weather />
      </div>
    {/if}

    {#if tickTickWidget?.enabled}
      <div
        class="col-span-{tickTickWidget.size.w} row-span-{tickTickWidget.size.h}"
        style="order: {tickTickWidget.order}"
      >
        <TickTick />
      </div>
    {/if}
  </div>
  <Settings />
</main>
