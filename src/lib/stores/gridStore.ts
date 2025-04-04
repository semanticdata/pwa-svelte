import { writable, get } from 'svelte/store';

export interface GridItem {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    content: string;
}

interface GridState {
    items: GridItem[];
    isLocked: boolean;
}

const STORAGE_KEY = 'grid-layout';
const DEBUG = true;

const log = (message: string, data?: any) => {
    if (DEBUG) {
        console.log(`[GridStore] ${message}`, data || '');
    }
};

const defaultState: GridState = {
    isLocked: false,
    items: [
        {
            id: 'clock',
            x: 0,
            y: 0,
            w: 6,
            h: 4,
            content: 'clock'
        },
        {
            id: 'placeholder',
            x: 0,
            y: 4,
            w: 6,
            h: 4,
            content: 'placeholder'
        },
        {
            id: 'placeholderslim',
            x: 0,
            y: 8,
            w: 6,
            h: 2,
            content: 'placeholderslim'
        }
    ]
};

const loadState = (): GridState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            log('Loading stored layout');
            return JSON.parse(stored);
        }
    } catch (error) {
        log('Error loading stored layout', error);
    }
    log('Using default layout');
    return defaultState;
};

const initialState = loadState();

const { subscribe, set, update } = writable<GridState>(initialState);

export const gridStore = {
    subscribe,
    set: (state: GridState) => {
        log('Setting new state', state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        set(state);
    },
    update: (updater: (state: GridState) => GridState) => {
        update(state => {
            const newState = updater(state);
            log('Updating state', newState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            return newState;
        });
    },
    reset: () => {
        log('Resetting to default layout');
        localStorage.removeItem(STORAGE_KEY);
        const newState = JSON.parse(JSON.stringify(defaultState)); // Deep clone to ensure clean state
        log('Default state to be applied:', newState);
        set(newState);
    }
};