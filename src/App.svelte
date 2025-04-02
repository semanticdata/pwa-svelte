<script>
  let currentDate = new Date();
  let timeString = "";
  let dateString = "";

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
    <div class="text-[clamp(1rem,3vw,1.25rem)] opacity-80">
      <p>Weather information coming soon...</p>
    </div>
  </div>
</main>
