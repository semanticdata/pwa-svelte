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
            w: 5,
            h: 5,
            content: 'clock'
        },
        {
            id: 'placeholder',
            x: 0,
            y: 5,
            w: 5,
            h: 5,
            content: 'placeholder'
        }
    ]
};

export const gridStore = writable<GridState>(initialState);