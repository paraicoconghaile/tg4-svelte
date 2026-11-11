
<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';

    declare global {
        interface Window {
            Cookiebot?: {
                consent?: {
                    statistics?: boolean;
                };
            };
            gtag?: (...args: any[]) => void;
        }
    }

    let lastTrackedUrl: string | null = null;

    function trackPageView() {
        if (
            window.Cookiebot?.consent?.statistics !== true ||
            typeof window.gtag !== 'function'
        ) {
            return;
        }

        const url = window.location.href;

        // Avoid duplicate page views for the same URL.
        if (lastTrackedUrl === url) return;

        window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: url,
            page_path: window.location.pathname + window.location.search
        });

        lastTrackedUrl = url;
    }

    onMount(() => {
        window.addEventListener('CookiebotOnConsentReady', trackPageView);
        window.addEventListener('CookiebotOnAccept', trackPageView);

        // Allow a fresh page view if consent is withdrawn and later restored.
        function handleDecline() {
            lastTrackedUrl = null;
        }

        window.addEventListener('CookiebotOnDecline', handleDecline);

        // Handles visitors who already have statistics consent.
        trackPageView();

        return () => {
            window.removeEventListener('CookiebotOnConsentReady', trackPageView);
            window.removeEventListener('CookiebotOnAccept', trackPageView);
            window.removeEventListener('CookiebotOnDecline', handleDecline);
        };
    });

    afterNavigate(({ from }) => {
        if (from !== null) {
            trackPageView();
        }
    });
</script>