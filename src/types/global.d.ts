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

declare global {
    var qt: Qt | undefined;
}

export {};
