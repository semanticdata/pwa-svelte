import { writable } from 'svelte/store';

interface WidgetSize {
    w: number;
    h: number;
}

interface BaseWidget {
    id: string;
    enabled: boolean;
    order: number;
    size: WidgetSize;
}

interface ClockWidget extends BaseWidget {
    id: 'clock';
    config: {
        show24Hour: boolean;
        showSeconds: boolean;
        showLocation: boolean;
    };
}

interface WeatherWidget extends BaseWidget {
    id: 'weather';
    config: Record<string, never>;
}

interface QuotesWidget extends BaseWidget {
    id: 'quotes';
    config: {
        category: string;
        refreshInterval: number;
    };
}

type Widget = ClockWidget | WeatherWidget | QuotesWidget;

interface GridConfig {
    columns: number;
    rows: number;
    gap: number;
    direction: 'horizontal' | 'vertical';
}

interface WidgetLayout {
    grid: GridConfig;
    widgets: {
        [K in Widget['id']]: Extract<Widget, { id: K }>;
    };
}

export const defaultLayout: WidgetLayout = {
    grid: {
        columns: 4,
        rows: 4,
        gap: 4,
        direction: 'horizontal' // or 'vertical'
    },
    widgets: {
        clock: {
            id: 'clock',
            enabled: true,
            order: 0,
            size: { w: 4, h: 2 }, // width and height in grid units
            config: {
                show24Hour: false,
                showSeconds: false,
                showLocation: false
            }
        },
        weather: {
            id: 'weather',
            enabled: true,
            order: 1,
            size: { w: 2, h: 2 },
            config: {}
        },
        quotes: {
            id: 'quotes',
            enabled: false,
            order: 2,
            size: { w: 2, h: 1 },
            config: {
                category: 'motivation',
                refreshInterval: 3600 // in seconds
            }
        }
    }
};

// Add export to type declarations
export type { Widget, WidgetLayout, GridConfig };

function createWidgetStore() {
    let initialLayout: WidgetLayout;
    try {
        const stored = localStorage.getItem('widget_layout');
        initialLayout = stored ? JSON.parse(stored) : defaultLayout;
        // Validate the stored data has the required structure
        if (!initialLayout.grid || !initialLayout.widgets) {
            throw new Error('Invalid stored layout');
        }
    } catch {
        initialLayout = defaultLayout;
    }

    const { subscribe, set, update } = writable<WidgetLayout>(initialLayout);

    return {
        subscribe,
        updateWidget: (id: Widget['id'], config: Partial<Widget>) => update(layout => {
            const widget = layout.widgets[id];
            const newLayout = {
                ...layout,
                widgets: {
                    ...layout.widgets,
                    [id]: { ...widget, ...config }
                }
            };
            localStorage.setItem('widget_layout', JSON.stringify(newLayout));
            return newLayout;
        }),
        updateGrid: (config: Partial<GridConfig>) => update(layout => {
            const newLayout = {
                ...layout,
                grid: { ...layout.grid, ...config }
            };
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