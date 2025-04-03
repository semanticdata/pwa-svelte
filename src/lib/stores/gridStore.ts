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
            h: 2,
            content: 'clock'
        },
        {
            id: 'placeholder',
            x: 0,
            y: 2,
            w: 6,
            h: 2,
            content: 'placeholder'
        }
    ]
};

export const gridStore = writable<GridState>(initialState);