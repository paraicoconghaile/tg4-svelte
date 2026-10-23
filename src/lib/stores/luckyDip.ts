import { writable } from 'svelte/store';

export const luckyDip = writable<Record<string, any> | null>(null);