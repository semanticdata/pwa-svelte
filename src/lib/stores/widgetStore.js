import { writable } from 'svelte/store';

const defaultLayout = {
    clock: { enabled: true, order: 0, size: 'lg' },
    weather: { enabled: true, order: 1, size: 'md' }
};

function createWidgetStore() {
    const { subscribe, set, update } = writable(
        JSON.parse(localStorage.getItem('widget_layout')) || defaultLayout
    );

    return {
        subscribe,
        updateWidget: (id, config) => update(layout => {
            const newLayout = { ...layout, [id]: { ...layout[id], ...config } };
            localStorage.setItem('widget_layout', JSON.stringify(newLayout));
            return newLayout;
        }),
        reset: () => {
            localStorage.setItem('widget_layout', JSON.stringify(defaultLayout));
            set(defaultLayout);
        }
    };
}

export const widgetLayout = createWidgetStore();
