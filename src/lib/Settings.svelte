<script lang="ts">
    import { onMount } from "svelte";
    import { weatherService } from "./weatherService";
    import { widgetLayout, defaultLayout } from "./stores/widgetStore";
    import type { Widget, GridConfig, WidgetSize } from "./stores/widgetStore";

    let showModal = false;
    let apiKey = "";
    let units = "metric";
    let useManualLocation = false;
    let useMockWeather = false;
    let latitude = "";
    let longitude = "";
    let locationSearch = "";
    let searchError = "";
    let activeTab = "grid";

    onMount(() => {
        apiKey = localStorage.getItem("openweather_api_key") || "";
        units = localStorage.getItem("weather_units") || "metric";
        useManualLocation =
            localStorage.getItem("use_manual_location") === "true";
        useMockWeather = localStorage.getItem("use_mock_weather") === "true";
        const savedLocation = weatherService.getSavedLocation();
        if (savedLocation) {
            latitude = savedLocation.lat.toString();
            longitude = savedLocation.lon.toString();
        }
    });

    function handleMockWeatherToggle() {
        localStorage.setItem("use_mock_weather", String(useMockWeather));
        window.location.reload();
    }

    async function validateApiKey(key) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${key}`,
            );
            if (response.status === 401) {
                throw new Error(
                    "Invalid API key. Please check your OpenWeather API key.",
                );
            }
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function searchByLocation() {
        try {
            searchError = "";
            if (!apiKey) {
                throw new Error("Please enter your OpenWeather API key first.");
            }
            const location =
                await weatherService.searchLocation(locationSearch);
            latitude = location.lat.toString();
            longitude = location.lon.toString();
        } catch (error) {
            searchError = error.message;
        }
    }

    async function saveSettings() {
        try {
            searchError = "";
            if (apiKey) {
                await validateApiKey(apiKey);
            }

            localStorage.setItem("openweather_api_key", apiKey);
            localStorage.setItem("weather_units", units);
            localStorage.setItem(
                "use_manual_location",
                useManualLocation.toString(),
            );
            weatherService.setApiKey(apiKey);
            weatherService.setUnits(units);

            if (useManualLocation && latitude && longitude) {
                weatherService.saveLocation({
                    lat: parseFloat(latitude),
                    lon: parseFloat(longitude),
                });
            }
            showModal = false;
            window.location.reload();
        } catch (error) {
            searchError = error.message;
        }
    }

    function updateWidgetConfig(id: Widget["id"], config: Partial<Widget>) {
        if ($widgetLayout?.widgets) {
            widgetLayout.updateWidget(id, config);
        }
    }

    function handleWidgetEnable(widget: Widget, e: Event) {
        const target = e.target as HTMLInputElement;
        updateWidgetConfig(widget.id, { enabled: target.checked });
    }

    function handleInputChange(
        e: Event,
        callback: (value: string | number | boolean) => void,
    ) {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const value =
            target.type === "checkbox"
                ? (target as HTMLInputElement).checked
                : target.value;
        callback(value);
    }

    function handleClockEnable(e: Event) {
        handleInputChange(e, (value) =>
            updateWidgetConfig("clock", { enabled: value as boolean }),
        );
    }

    function handleClockOrder(e: Event) {
        handleInputChange(e, (value) =>
            updateWidgetConfig("clock", {
                order: Math.max(0, parseInt(value as string) || 0),
            }),
        );
    }

    function handleWeatherEnable(e: Event) {
        handleInputChange(e, (value) =>
            updateWidgetConfig("weather", { enabled: value as boolean }),
        );
    }

    function handleWeatherOrder(e: Event) {
        handleInputChange(e, (value) =>
            updateWidgetConfig("weather", {
                order: Math.max(0, parseInt(value as string) || 0),
            }),
        );
    }

    function handleWidgetSize(widget: Widget, e: Event) {
        const target = e.target as HTMLSelectElement;
        const [w, h] = target.value.split("x").map(Number);
        updateWidgetConfig(widget.id, {
            size: { w, h } as WidgetSize,
        });
    }

    function updateGridConfig(key: keyof GridConfig, value: number | string) {
        if ($widgetLayout?.grid) {
            widgetLayout.updateGrid({ [key]: value });
        }
    }
</script>

<div class="fixed bottom-4 right-4">
    <button
        class="btn btn-circle bg-blue-500 hover:bg-blue-600 text-white"
        on:click={() => (showModal = true)}
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
</div>

{#if showModal}
    <div class="modal modal-open">
        <div
            class="modal-box max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800"
        >
            <h3 class="font-bold text-lg mb-4">Settings</h3>

            <div class="tabs tabs-boxed mb-4">
                <button
                    class="tab {activeTab === 'grid' ? 'tab-active' : ''}"
                    on:click={() => (activeTab = "grid")}
                >
                    Grid
                </button>
                <button
                    class="tab {activeTab === 'widgets' ? 'tab-active' : ''}"
                    on:click={() => (activeTab = "widgets")}
                >
                    Widgets
                </button>
                <button
                    class="tab {activeTab === 'weather' ? 'tab-active' : ''}"
                    on:click={() => (activeTab = "weather")}
                >
                    Weather
                </button>
            </div>

            {#if activeTab === "grid"}
                <div class="form-control w-full">
                    <label class="label" for="gridLayout">Grid Layout</label>
                    <div class="grid grid-cols-2 gap-4" id="gridLayout">
                        <div>
                            <label class="label" for="columns">Columns</label>
                            <input
                                type="number"
                                id="columns"
                                class="input input-bordered w-full"
                                value={$widgetLayout.grid.columns}
                                min="1"
                                max="12"
                                on:change={(e) =>
                                    handleInputChange(e, (value) =>
                                        updateGridConfig(
                                            "columns",
                                            parseInt(value as string),
                                        ),
                                    )}
                            />
                        </div>
                        <div>
                            <label class="label" for="rows">Rows</label>
                            <input
                                type="number"
                                id="rows"
                                class="input input-bordered w-full"
                                value={$widgetLayout.grid.rows}
                                min="1"
                                max="12"
                                on:change={(e) =>
                                    handleInputChange(e, (value) =>
                                        updateGridConfig(
                                            "rows",
                                            parseInt(value as string),
                                        ),
                                    )}
                            />
                        </div>
                        <div>
                            <label class="label" for="gap">Gap (rem)</label>
                            <input
                                type="number"
                                id="gap"
                                class="input input-bordered w-full"
                                value={$widgetLayout.grid.gap}
                                min="0"
                                max="8"
                                step="0.5"
                                on:change={(e) =>
                                    handleInputChange(e, (value) =>
                                        updateGridConfig(
                                            "gap",
                                            parseFloat(value as string),
                                        ),
                                    )}
                            />
                        </div>
                        <div>
                            <label class="label" for="direction"
                                >Direction</label
                            >
                            <select
                                id="direction"
                                class="select select-bordered w-full"
                                value={$widgetLayout.grid.direction}
                                on:change={(e) =>
                                    handleInputChange(e, (value) =>
                                        updateGridConfig(
                                            "direction",
                                            value as string,
                                        ),
                                    )}
                            >
                                <option value="horizontal">Horizontal</option>
                                <option value="vertical">Vertical</option>
                            </select>
                        </div>
                    </div>
                </div>
            {:else if activeTab === "widgets" && $widgetLayout?.widgets}
                {#each Object.values($widgetLayout.widgets) as widget}
                    <div class="collapse collapse-arrow bg-base-200 mb-2">
                        <input type="checkbox" id="widget-{widget.id}" />
                        <div class="collapse-title font-medium">
                            <label for="widget-{widget.id}">
                                {widget.id.charAt(0).toUpperCase() +
                                    widget.id.slice(1)} Widget
                            </label>
                        </div>
                        <div class="collapse-content">
                            <div class="form-control">
                                <label class="label cursor-pointer">
                                    <span class="label-text">Enable</span>
                                    <input
                                        type="checkbox"
                                        id="enable-{widget.id}"
                                        class="toggle"
                                        checked={widget.enabled}
                                        on:change={(e) =>
                                            handleInputChange(e, (value) =>
                                                updateWidgetConfig(widget.id, {
                                                    enabled: value as boolean,
                                                }),
                                            )}
                                    />
                                </label>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label class="label" for="width-{widget.id}"
                                        >Width</label
                                    >
                                    <select
                                        id="size-{widget.id}"
                                        class="select select-bordered w-full"
                                        value="{widget.size.w}x{widget.size.h}"
                                        on:change={(e) =>
                                            handleWidgetSize(widget, e)}
                                    >
                                        <option value="1x1">Small (1x1)</option>
                                        <option value="2x2">Medium (2x2)</option
                                        >
                                        <option value="4x2">Large (4x2)</option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        class="label"
                                        for="height-{widget.id}">Height</label
                                    >
                                    <input
                                        type="number"
                                        id="height-{widget.id}"
                                        class="input input-bordered w-full"
                                        value={widget.size.h}
                                        min="1"
                                        max={$widgetLayout.grid.rows}
                                        on:change={(e) =>
                                            handleInputChange(e, (value) =>
                                                updateWidgetConfig(widget.id, {
                                                    size: {
                                                        ...widget.size,
                                                        h: parseInt(
                                                            value as string,
                                                        ),
                                                    },
                                                }),
                                            )}
                                    />
                                </div>
                            </div>
                            <div class="mt-2">
                                <label class="label" for="order-{widget.id}"
                                    >Order</label
                                >
                                <input
                                    type="number"
                                    id="order-{widget.id}"
                                    class="input input-bordered w-full"
                                    value={widget.order}
                                    min="0"
                                    on:change={(e) =>
                                        handleInputChange(e, (value) =>
                                            updateWidgetConfig(widget.id, {
                                                order: parseInt(
                                                    value as string,
                                                ),
                                            }),
                                        )}
                                />
                            </div>
                            {#if widget.id === "clock"}
                                <div class="form-control mt-2">
                                    <label class="label cursor-pointer">
                                        <span class="label-text"
                                            >24-hour format</span
                                        >
                                        <input
                                            type="checkbox"
                                            class="toggle"
                                            checked={widget.config
                                                ?.show24Hour ?? false}
                                            on:change={(e) =>
                                                updateWidgetConfig(widget.id, {
                                                    config: {
                                                        ...widget.config,
                                                        show24Hour: (
                                                            e.target as HTMLInputElement
                                                        ).checked,
                                                    },
                                                })}
                                        />
                                    </label>
                                </div>
                                <div class="form-control">
                                    <label class="label cursor-pointer">
                                        <span class="label-text"
                                            >Show seconds</span
                                        >
                                        <input
                                            type="checkbox"
                                            class="toggle"
                                            checked={widget.config
                                                ?.showSeconds ?? false}
                                            on:change={(e) =>
                                                updateWidgetConfig(widget.id, {
                                                    config: {
                                                        ...widget.config,
                                                        showSeconds: (
                                                            e.target as HTMLInputElement
                                                        ).checked,
                                                    },
                                                })}
                                        />
                                    </label>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            {:else if activeTab === "weather"}
                <div class="form-control w-full">
                    <label class="label" for="apiKey">
                        <span class="label-text">OpenWeather API Key</span>
                    </label>
                    <input
                        type="password"
                        id="apiKey"
                        placeholder="Enter your API key"
                        class="input input-bordered w-full"
                        bind:value={apiKey}
                    />
                    <label class="label" for="apiKeyHelp"></label>
                    <label for="apiKeyHelp" class="label-text-alt"
                        >Get your API key from <a
                            href="https://openweathermap.org/api"
                            target="_blank"
                            class="link">OpenWeather</a
                        ></label
                    >
                    <span id="apiKeyHelp" class="sr-only"
                        >Link to OpenWeather API documentation</span
                    >
                </div>
                <div class="form-control w-full mt-4">
                    <label class="label" for="units">
                        <span class="label-text">Temperature Units</span>
                    </label>
                    <select
                        id="units"
                        class="select select-bordered w-full"
                        bind:value={units}
                    >
                        <option value="metric">Metric (°C, m/s)</option>
                        <option value="imperial">Imperial (°F, mph)</option>
                    </select>
                </div>

                <div class="form-control w-full mt-4">
                    <label class="label cursor-pointer">
                        <span class="label-text">Use Manual Location</span>
                        <input
                            type="checkbox"
                            class="toggle bg-gray-200 checked:bg-blue-500"
                            bind:checked={useManualLocation}
                        />
                    </label>
                </div>

                {#if import.meta.env.DEV}
                    <div class="form-control w-full mt-4">
                        <label class="label cursor-pointer">
                            <span class="label-text"
                                >Use Mock Weather Data (Dev Only)</span
                            >
                            <input
                                type="checkbox"
                                class="toggle bg-gray-200 checked:bg-blue-500"
                                bind:checked={useMockWeather}
                                on:change={handleMockWeatherToggle}
                            />
                        </label>
                    </div>
                {/if}

                {#if useManualLocation}
                    <div class="form-control w-full mt-4">
                        <label class="label" for="locationSearch">
                            <span class="label-text">Search Location</span>
                        </label>
                        <div class="flex gap-2">
                            <input
                                type="text"
                                id="locationSearch"
                                placeholder="Enter city name or zip code"
                                class="input input-bordered flex-1"
                                bind:value={locationSearch}
                                disabled={!useManualLocation}
                                aria-describedby="searchError"
                            />
                            <button
                                class="btn bg-blue-500 hover:bg-blue-600 text-white"
                                on:click={searchByLocation}
                                disabled={!useManualLocation || !locationSearch}
                            >
                                Search
                            </button>
                        </div>
                        {#if searchError}
                            <label class="label" for="locationSearch">
                                <span
                                    id="searchError"
                                    class="label-text-alt text-error"
                                    >{searchError}</span
                                >
                            </label>
                        {/if}
                    </div>
                    <div class="form-control w-full mt-4">
                        <label class="label" for="coordinatesGroup">
                            <span class="label-text"
                                >Coordinates (auto-filled from search)</span
                            >
                        </label>
                        <div
                            id="coordinatesGroup"
                            class="grid grid-cols-2 gap-2"
                        >
                            <input
                                type="text"
                                id="latitude"
                                placeholder="Latitude"
                                class="input input-bordered"
                                bind:value={latitude}
                                disabled
                                aria-label="Latitude"
                            />
                            <input
                                type="text"
                                id="longitude"
                                placeholder="Longitude"
                                class="input input-bordered"
                                bind:value={longitude}
                                disabled
                                aria-label="Longitude"
                            />
                        </div>
                    </div>
                {/if}
            {/if}

            <div class="modal-action">
                <button class="btn" on:click={() => (showModal = false)}
                    >Cancel</button
                >
                <button
                    class="btn bg-blue-500 hover:bg-blue-600 text-white"
                    on:click={saveSettings}>Save</button
                >
            </div>
        </div>
    </div>
{/if}
