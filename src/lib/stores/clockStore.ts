import { writable } from 'svelte/store';

// Create a store for clock settings
export const clockSettings = writable({
  use24Hour: false,
  showSeconds: true,
  dateFormat: 'full', // full, short, or numeric
});