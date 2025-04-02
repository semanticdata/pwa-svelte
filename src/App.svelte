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

<main class="min-h-screen bg-base-100 p-4 md:p-8 select-none">
  <div class="hero min-h-[40vh] bg-base-200 rounded-box mb-8">
    <div class="hero-content text-center">
      <div>
        <h1 class="text-[clamp(3rem,15vw,8rem)] font-bold mb-4 tracking-tight">
          {timeString}
        </h1>
        <p class="text-[clamp(1.5rem,5vw,2.5rem)] font-normal opacity-80">
          {dateString}
        </p>
      </div>
    </div>
  </div>
  <Weather />
</main>
