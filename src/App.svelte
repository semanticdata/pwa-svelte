<script>
  import { onMount } from "svelte";
  import Weather from "./lib/Weather.svelte";
  import Settings from "./lib/Settings.svelte";

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
</script>

<main
  class="h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 select-none flex flex-col gap-4 overflow-hidden"
>
  <div class="hero bg-white dark:bg-gray-800 rounded-box shrink-0">
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
  <Weather />
  <Settings />
</main>
