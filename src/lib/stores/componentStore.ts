import { writable } from 'svelte/store';

// Create a store for component visibility settings
export const componentSettings = writable({
    showClock: true,
    showPlaceholder: true,
    showPlaceholderSlim: true
});