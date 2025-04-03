import { writable } from 'svelte/store';

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
}

const initialState: GridState = {
    items: [
        {
            id: 'clock',
            x: 0,
            y: 0,
            w: 6,
            h: 6,
            content: 'clock'
        },
        {
            id: 'placeholder',
            x: 0,
            y: 4,
            w: 6,
            h: 6,
            content: 'placeholder'
        }
    ]
};

export const gridStore = writable<GridState>(initialState);