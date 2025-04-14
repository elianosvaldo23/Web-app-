/* eslint-disable no-var */

type QtTransportMessage = {
    data: string;
};

interface QtTransport {
    send: (message: string) => void,
    onmessage: (message: QtTransportMessage) => void,
}

interface Qt {
    webChannelTransport: QtTransport,
}

interface ChromeWebView {
    addEventListener: (type: 'message', listenenr: (event: any) => void) => void,
    removeEventListener: (type: 'message', listenenr: (event: any) => void) => void,
    postMessage: (message: string) => void,
}

interface Chrome {
    webview: ChromeWebView,
}

declare global {
    var qt: Qt | undefined;
    var chrome: Chrome | undefined;
    interface Window {
        AppleID: {
            auth: {
                init: (config: {
                    clientId: string;
                    scope: string;
                    redirectURI: string;
                    usePopup: boolean;
                }) => void;
                signIn: () => Promise<{
                    authorization: {
                        code?: string;
                        id_token: string;
                        state?: string;
                    };
                    email?: string;
                    fullName?: {
                        firstName?: string;
                        lastName?: string;
                    };
                }>;
            };
        };
    }
}

export {};
