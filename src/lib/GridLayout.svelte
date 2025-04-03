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

    gridStore.subscribe((state) => {
        items = state.items;
    });

    onMount(() => {
        grid = GridStack.init(
            {
                column: 12,
                row: 12,
                cellHeight: 60,
                animate: true,
                draggable: {
                    handle: ".grid-stack-item-content",
                },
                resizable: {
                    handles: "all",
                },
            },
            gridElement,
        );

        // Update store when grid changes
        grid.on("change", (event, gridItems) => {
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
                data-gs-id={item.id}
                data-gs-x={item.x}
                data-gs-y={item.y}
                data-gs-width={item.w}
                data-gs-height={item.h}
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
