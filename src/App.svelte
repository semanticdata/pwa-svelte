<script>
  import { onMount } from "svelte";
  import Weather from "./lib/Weather.svelte";
  import Settings from "./lib/Settings.svelte";
  import { widgetLayout } from "./lib/stores/widgetStore";

  let timeString;
  let dateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function updateTime() {
    timeString = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  onMount(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  });

  $: clockWidget = $widgetLayout.clock;
  $: weatherWidget = $widgetLayout.weather;

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
