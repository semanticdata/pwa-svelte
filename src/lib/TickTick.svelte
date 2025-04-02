<script lang="ts">
    import { onMount } from "svelte";
    import { tickTickService } from "./tickTickService";
    import { widgetLayout, defaultLayout } from "./stores/widgetStore";
    import type { Task } from "./tickTickService";
    
    let tasks: Task[] = [];
    let loading = true;
    let error: string | null = null;

    $: config = $widgetLayout?.widgets?.ticktick?.config ?? defaultLayout.widgets.ticktick.config;
    $: filteredTasks = config.showCompleted ? tasks : tasks.filter(t => !t.completed);

    async function loadTasks() {
        loading = true;
        error = null;
        try {
            tasks = await tickTickService.getTasks();
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadTasks();
    });
</script>

<div class="card w-full h-full bg-white dark:bg-gray-800 shadow-xl backdrop-blur-lg">
    <div class="card-body h-full overflow-y-auto p-4">
        <h2 class="card-title text-2xl mb-2 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
            Tasks
        </h2>
        <div class="text-base">
            {#if loading}
                <div class="flex justify-center">
                    <span class="loading loading-spinner loading-lg"></span>
                </div>
            {:else if error}
                <div class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            {:else}
                <div class="flex flex-col gap-2">
                    {#each filteredTasks as task}
                        <div class="flex items-center gap-2 p-2 bg-base-300 rounded-box">
                            <input type="checkbox" checked={task.completed} class="checkbox" />
                            <span class:line-through={task.completed}>{task.title}</span>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
