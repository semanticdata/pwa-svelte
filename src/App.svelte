<script>
  import { onMount } from 'svelte';
  import Weather from './lib/Weather.svelte';

  let timeString;
  let dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function updateTime() {
    timeString = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  onMount(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  });
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
  <Weather />
</main>
