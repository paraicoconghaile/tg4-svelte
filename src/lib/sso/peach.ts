declare global {
    interface Window {
        PeachUser: any;
        _pu: any;
    }
}

let peachPromise: Promise<any> | null = null;

export function loadPeachUser(): Promise<any> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Peach User can only be loaded in the browser'));
    }

    // Already loaded
    if (window._pu) {
        return Promise.resolve(window._pu);
    }

    // Already loading
    if (peachPromise) {
        return peachPromise;
    }

    peachPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.src = 'https://peach-static.ebu.io/peach-user.min.js';
        script.defer = true;

        script.onload = () => {
            try {
                if (!window.PeachUser) {
                    reject(new Error('PeachUser library loaded but PeachUser is not available'));
                    return;
                }

                const pu = new window.PeachUser(window);

                pu.init({
                    idp_url: 'https://sso.tg4.ie',
                    api_url: 'https://user.tg4.ie'
                });

                window._pu = pu;

                console.log('Peach User initialised');

                resolve(pu);
            } catch (error) {
                reject(error);
            }
        };

        script.onerror = () => {
            reject(new Error('Failed to load Peach User library'));
        };

        document.head.appendChild(script);
    });

    return peachPromise;
}