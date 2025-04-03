<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { GridStack } from "gridstack";
    import "gridstack/dist/gridstack.min.css";
    import { gridStore, type GridItem } from "./stores/gridStore";
    import Clock from "./Clock.svelte";
    import Placeholder from "./Placeholder.svelte";
    import { componentSettings } from "./stores/componentStore";

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
                        !$componentSettings.showPlaceholder)
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
                        $componentSettings.showPlaceholder)
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
        grid = GridStack.init(
            {
                column: 12,
                row: 12,
                cellHeight: "8vh",
                animate: true,
                // margin: 0,
                draggable: {
                    handle: ".grid-stack-item-content",
                },
                resizable: {
                    handles: "se",
                    start: (event, el) => {
                        // Ensure element exists and has required properties
                        if (el && el.gridstackNode) {
                            el.gridstackNode._isResizing = true;
                        }
                    },
                    stop: (event, el) => {
                        // Clean up resize state
                        if (el && el.gridstackNode) {
                            el.gridstackNode._isResizing = false;
                        }
                    },
                },
                float: true,
                // disableOneColumnMode: true,
            },
            gridElement,
        );

        grid.on("change", (event, gridItems) => {
            if (!grid || !grid.el) return;

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
            default:
                return null;
        }
    };
</script>

<div class="grid-stack" bind:this={gridElement}>
    {#each items as item}
        {#if (item.content === "clock" && $componentSettings.showClock) || (item.content === "placeholder" && $componentSettings.showPlaceholder)}
            <div
                class="grid-stack-item"
                gs-id={item.id}
                gs-x={item.x}
                gs-y={item.y}
                gs-w={item.w}
                gs-h={item.h}
            >
                <div
                    class="grid-stack-item-content bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
                >
                    <svelte:component this={getComponent(item.content)} />
                </div>
            </div>
        {/if}
    {/each}
</div>

<style>
    /* :global(body) {
        margin: 0;
        overflow: hidden;
        height: 100vh;
        width: 100vw;
    } */

    /* :global(.grid-stack) {
        height: 100vh !important;
        width: 100vw !important;
        margin: 0 !important;
        padding: 0 !important;
    } */

    /* :global(.grid-stack-item) {
        margin: 0 !important;
        padding: 0 !important;
    } */

    :global(.grid-stack-item-content) {
        cursor: move;
    }

    :global(.grid-stack-item-content:hover) {
        outline: 2px solid #4299e1;
    }

    :global(.grid-stack-placeholder) {
        background-color: rgba(66, 153, 225, 0.2);
        border: 2px dashed #4299e1;
        border-radius: 0.5rem;
    }
</style>
