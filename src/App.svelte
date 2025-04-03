<script lang="ts">
  import Clock from "./lib/Clock.svelte";
  import Settings from "./lib/Settings.svelte";
</script>

<main
  class="h-screen bg-gray-100 dark:bg-gray-900 p-0 md:p-8 select-none overflow-hidden"
>
  <div class="grid auto-rows-min h-full">
    <div class="">
      <Clock />
    </div>
  </div>
  <Settings />
</main>
