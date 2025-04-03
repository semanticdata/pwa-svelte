<script lang="ts">
  import Clock from "./lib/Clock.svelte";
  import Settings from "./lib/Settings.svelte";
  import Placeholder from "./lib/Placeholder.svelte";
  import { componentSettings } from "./lib/stores/componentStore";
</script>

<main
  class="h-screen bg-gray-100 dark:bg-gray-900 p-0 md:p-8 select-none overflow-hidden"
>
  <div class="grid auto-rows-min gap-4 h-full">
    {#if $componentSettings.showClock}
      <div class="">
        <Clock />
      </div>
    {/if}
    {#if $componentSettings.showPlaceholder}
      <div class="">
        <Placeholder />
      </div>
    {/if}
  </div>
  <Settings />
</main>
