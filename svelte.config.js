import adapter from 'amplify-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = '';

export default {
    preprocess: vitePreprocess(),

    kit: {
        paths: {
            base
        },
        adapter: adapter()
    }
};