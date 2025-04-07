<script lang="ts">
    import { clockSettings } from "./stores/clockStore";
    import { componentSettings } from "./stores/componentStore";
    import { gridStore } from "./stores/gridStore";

    let showModal = false;
    let activeTab = "clock";
    let localClockSettings = $clockSettings;
    let localComponentSettings = $componentSettings;
    let localGridLocked = $gridStore.isLocked;

    function toggleModal() {
        showModal = !showModal;
        // Reset local settings when opening modal
        if (showModal) {
            localClockSettings = { ...$clockSettings };
            localComponentSettings = { ...$componentSettings };
        }
    }

    function saveSettings() {
        clockSettings.set(localClockSettings);
        componentSettings.set(localComponentSettings);
        gridStore.update(state => ({ ...state, isLocked: localGridLocked }));
        showModal = false;
        // Add a small delay before reload to ensure settings are saved
        setTimeout(() => window.location.reload(), 100);
    }
</script>

<button
    on:click={toggleModal}
    class="btn btn-circle bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 absolute bottom-4 right-4"
    title="Settings"
    aria-label="Open settings"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
    </svg>
</button>

{#if showModal}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Settings</h3>

            <div class="tabs tabs-boxed mb-4">
                <button
                    class="tab {activeTab === 'clock' ? 'tab-active' : ''}"
                    on:click={() => (activeTab = "clock")}
                >
                    Clock
                </button>
                <button
                    class="tab {activeTab === 'components' ? 'tab-active' : ''}"
                    on:click={() => (activeTab = "components")}
                >
                    Components
                </button>
                <button
                    class="tab {activeTab === 'layout' ? 'tab-active' : ''}"
                    on:click={() => (activeTab = "layout")}
                >
                    Layout
                </button>
            </div>

            {#if activeTab === "clock"}
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">24-hour format</span>
                        <input
                            type="checkbox"
                            class="toggle"
                            bind:checked={localClockSettings.use24Hour}
                        />
                    </label>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Show seconds</span>
                        <input
                            type="checkbox"
                            class="toggle"
                            bind:checked={localClockSettings.showSeconds}
                        />
                    </label>
                </div>

                <div class="form-control">
                    <label class="label" for="dateFormat"></label>
                    <span class="label-text">Date format</span>
                    <select
                        class="select select-bordered w-full"
                        bind:value={localClockSettings.dateFormat}
                    >
                        <option value="full"
                            >Full (Monday, January 1, 2024)</option
                        >
                        <option value="short">Short (Mon, Jan 1, 2024)</option>
                        <option value="numeric">Numeric (01/01/2024)</option>
                    </select>
                </div>
            {/if}

            {#if activeTab === "components"}
                <div class="space-y-4">
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Show Clock</span>
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={localComponentSettings.showClock}
                            />
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Show Placeholder</span>
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={
                                    localComponentSettings.showPlaceholder
                                }
                            />
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Show Placeholder Slim</span
                            >
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={
                                    localComponentSettings.showPlaceholderSlim
                                }
                            />
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Show Weather</span
                            >
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={
                                    localComponentSettings.showWeather
                                }
                            />
                        </label>
                    </div>
                </div>
            {/if}

            {#if activeTab === "layout"}
                <div class="space-y-6">
                    <div class="form-control bg-base-200 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">Grid Interaction</h4>
                        <label class="label cursor-pointer">
                            <span class="label-text">Lock Grid Layout</span>
                            <input
                                type="checkbox"
                                class="toggle toggle-primary"
                                bind:checked={localGridLocked}
                            />
                        </label>
                        <p class="text-sm text-base-content/70 mt-1">
                            When enabled, components cannot be moved or resized
                        </p>
                    </div>

                    <div class="form-control bg-base-200 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">Reset Options</h4>
                        <button
                            class="btn btn-secondary w-full"
                            on:click={() => {
                                gridStore.reset();
                            }}
                        >
                            Reset Layout
                        </button>
                        <p class="text-sm text-base-content/70 mt-2">
                            Resets all components to their default positions and sizes
                        </p>
                    </div>
                </div>
            {/if}

            <div class="modal-action">
                <button class="btn" on:click={toggleModal}>Cancel</button>
                <button class="btn btn-primary" on:click={saveSettings}>Save</button>
            </div>
        </div>
    </div>
{/if}


