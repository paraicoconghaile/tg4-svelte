declare global {
    interface Window {
        NOLBUNDLE?: any;
    }
}

export function loadNielsenSdk() {
    if (typeof window === 'undefined') return;

    if (window.NOLBUNDLE?.nlsQ) return;

    const win = window as any;

    function clone(value: any) {
        return typeof value === 'object'
            ? JSON.parse(JSON.stringify(value))
            : value;
    }

    win.NOLBUNDLE = {
        nlsQ(appId: string, instanceName: string, config: any = {}) {
            const script = document.createElement('script');

            script.async = true;
            script.src =
                `https://cdn-gl.nmrodam.com/conf/${appId}.js` +
                `#name=${instanceName}&ns=NOLBUNDLE`;

            document.head.appendChild(script);

            win.NOLBUNDLE[instanceName] =
                win.NOLBUNDLE[instanceName] || {
                    g: config,

                    ggPM(...args: any[]) {
                        const instance = win.NOLBUNDLE[instanceName];
                        instance.q = instance.q || [];

                        try {
                            instance.q.push(clone(args));
                        } catch (error) {
                            console.error('Nielsen queue error:', error);
                        }
                    },

                    trackEvent(event: any) {
                        const instance = win.NOLBUNDLE[instanceName];
                        instance.te = instance.te || [];

                        try {
                            instance.te.push(clone(event));
                        } catch (error) {
                            console.error('Nielsen event error:', error);
                        }
                    }
                };

            return win.NOLBUNDLE[instanceName];
        }
    };
}