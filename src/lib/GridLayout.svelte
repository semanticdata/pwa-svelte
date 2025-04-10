<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { GridStack } from "gridstack";
    import "gridstack/dist/gridstack.min.css";
    import { gridStore, type GridItem } from "./stores/gridStore";
    import Clock from "./Clock.svelte";
    import Placeholder from "./Placeholder.svelte";
    import PlaceholderSlim from "./PlaceholderSlim.svelte";
    import Weather from "./Weather.svelte";
    import { componentSettings } from "./stores/componentStore";
    import { get } from "svelte/store";

    const DEBUG = true;
    const log = (message: string, data?: any) => {
        if (DEBUG) {
            const timestamp = new Date().toISOString();
            console.log(`[GridLayout ${timestamp}] ${message}`, data || "");
        }
    };

    let gridElement: HTMLElement;
    let grid: GridStack;
    let items: GridItem[];

    const unsubscribe = gridStore.subscribe((state) => {
        items = state.items;
        if (
            grid &&
            grid.el &&
            !grid.el.classList.contains("grid-stack-updating")
        ) {
            const currentGridItems = Array.from(
                grid.el.querySelectorAll(".grid-stack-item"),
            );
            const currentIds = currentGridItems.map((el) =>
                el.getAttribute("gs-id"),
            );

            // Remove widgets that are no longer in the state
            currentGridItems.forEach((el) => {
                const id = el.getAttribute("gs-id");
                const stateItem = items.find((item) => item.id === id);
                if (
                    !stateItem ||
                    (stateItem.content === "clock" &&
                        !$componentSettings.showClock) ||
                    (stateItem.content === "placeholder" &&
                        !$componentSettings.showPlaceholder) ||
                    (stateItem.content === "placeholderslim" &&
                        !$componentSettings.showPlaceholderSlim) ||
                    (stateItem.content === "weather" &&
                        !$componentSettings.showWeather)
                ) {
                    grid.removeWidget(el);
                }
            });

            // Update or add widgets from state
            items.forEach((item) => {
                if (
                    (item.content === "clock" &&
                        $componentSettings.showClock) ||
                    (item.content === "placeholder" &&
                        $componentSettings.showPlaceholder) ||
                    (item.content === "placeholderslim" &&
                        $componentSettings.showPlaceholderSlim) ||
                    (item.content === "weather" &&
                        $componentSettings.showWeather)
                ) {
                    const existingEl = grid.el.querySelector(
                        `[gs-id="${item.id}"]`,
                    );

                    if (!existingEl) {
                        grid.addWidget({
                            id: item.id,
                            x: item.x,
                            y: item.y,
                            w: item.w,
                            h: item.h,
                            autoPosition: false,
                        });
                    } else {
                        grid.update(existingEl, {
                            x: item.x,
                            y: item.y,
                            w: item.w,
                            h: item.h,
                        });
                    }
                }
            });
        }
    });

    onMount(() => {
        const initialLocked = get(gridStore).isLocked;
        grid = GridStack.init(
            {
                column: 12,
                row: 12,
                cellHeight: "8vh",
                animate: true,
                draggable: initialLocked
                    ? false
                    : {
                          handle: ".grid-stack-item-content",
                      },
                resizable: initialLocked
                    ? false
                    : {
                          handles: "se",
                          start: (event, el) => {
                              if (el && el.gridstackNode) {
                                  el.gridstackNode._isResizing = true;
                              }
                          },
                          stop: (event, el) => {
                              if (el && el.gridstackNode) {
                                  el.gridstackNode._isResizing = false;
                              }
                          },
                      },
                float: true,
            },
            gridElement,
        );

        // Subscribe to lock changes
        gridStore.subscribe((state) => {
            if (grid) {
                log(`Lock state changed to: ${state.isLocked}`);
                grid.batchUpdate();
                try {
                    grid.enableMove(!state.isLocked);
                    grid.enableResize(!state.isLocked);

                    // Ensure all items are properly positioned before committing
                    setTimeout(() => {
                        items.forEach((item) => {
                            const el = grid.el.querySelector(
                                `[gs-id="${item.id}"]`,
                            );
                            if (el) {
                                grid.update(el, {
                                    x: item.x,
                                    y: item.y,
                                    w: item.w,
                                    h: item.h,
                                });
                            }
                        });
                        grid.commit();
                    }, 50);
                } catch (error) {
                    console.error(
                        "Error during grid lock state change:",
                        error,
                    );
                    grid.commit();
                }
            }
        });

        grid.on("change", (event, gridItems) => {
            if (!grid || !grid.el) return;

            log("Grid change event detected:", {
                eventType: event,
                changedItems: gridItems.map((item) => ({
                    id: item.id,
                    position: `(${item.x},${item.y})`,
                    size: `${item.w}x${item.h}`,
                })),
            });

            gridStore.update((state) => {
                const updatedItems = state.items.map((existingItem) => {
                    const changedItem = gridItems.find(
                        (item) => item.id === existingItem.id,
                    );
                    if (changedItem) {
                        return {
                            ...existingItem,
                            x: changedItem.x,
                            y: changedItem.y,
                            w: changedItem.w,
                            h: changedItem.h,
                        };
                    }
                    return existingItem;
                });
                return { ...state, items: updatedItems };
            });
        });
    });

    onDestroy(() => {
        if (grid) {
            grid.removeAll();
            grid.destroy(false);
            grid = null;
        }
        if (unsubscribe) {
            unsubscribe();
        }
    });

    const getComponent = (content: string) => {
        switch (content) {
            case "clock":
                return Clock;
            case "placeholder":
                return Placeholder;
            case "placeholderslim":
                return PlaceholderSlim;
            case "weather":
                return Weather;
            default:
                return null;
        }
    };
</script>

<div
    class="grid-stack {!$gridStore.isLocked ? 'unlocked' : ''}"
    bind:this={gridElement}
>
    {#each items as item}
        {#if (item.content === "clock" && $componentSettings.showClock) || (item.content === "placeholder" && $componentSettings.showPlaceholder) || (item.content === "placeholderslim" && $componentSettings.showPlaceholderSlim) || (item.content === "weather" && $componentSettings.showWeather)}
            <div
                class="grid-stack-item"
                gs-id={item.id}
                gs-x={item.x}
                gs-y={item.y}
                gs-w={item.w}
                gs-h={item.h}
            >
                <div
                    class="grid-stack-item-content bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                >
                    <svelte:component this={getComponent(item.content)} />
                </div>
            </div>
        {/if}
    {/each}
</div>

<style>
    :global(.unlocked .grid-stack-item-content) {
        cursor: move;
    }

    :global(.unlocked .grid-stack-item-content:hover) {
        outline: 2px solid #4299e1;
    }

    :global(.grid-stack-placeholder) {
        background-color: rgba(66, 153, 225, 0.2);
        border: 2px dashed #4299e1;
        border-radius: 0.5rem;
    }
</style>
