<script lang="ts">
  import { onMount } from "svelte";
  import { clockSettings } from "./stores/clockStore";

  let timeString: string;
  let dateString: string;

  function updateTime() {
    const now = new Date();
    const settings = $clockSettings;

    // Format time based on settings
    timeString = now.toLocaleTimeString("en-US", {
      hour12: !settings.use24Hour,
      hour: "2-digit",
      minute: "2-digit",
      second: settings.showSeconds ? "2-digit" : undefined,
    });

    // Format date based on settings
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: settings.dateFormat === "full" ? "long" : "short",
      year: "numeric",
      month: settings.dateFormat === "numeric" ? "2-digit" : settings.dateFormat === "full" ? "long" : "short",
      day: "numeric",
    };
    dateString = now.toLocaleDateString("en-US", dateOptions);
  }

  onMount(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="hero bg-white dark:bg-gray-800 rounded-box h-full">
  <div class="hero-content text-center">
    <div>
      <h1 class="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 tracking-tight">
        {timeString}
      </h1>
      <p class="text-xl md:text-2xl lg:text-3xl font-normal opacity-80">
        {dateString}
      </p>
    </div>
  </div>
</div>