import adapter from 'amplify-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.SVELTEKIT_BASE_PATH || '';

export default {
    preprocess: vitePreprocess(),

    kit: {
        paths: {
            base
        },
        adapter: adapter()
    }
};