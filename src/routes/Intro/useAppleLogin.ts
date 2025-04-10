import { useCallback, useRef } from 'react';

type AppleLoginResponse = {
    token: string;
    sub: string;
    email: string;
    name: string;
};

type AppleSignInResponse = {
    authorization: {
        id_token: string;
    };
    authorizedData: {
        userId: string;
    };
    email?: string;
    fullName?: {
        firstName?: string;
        lastName?: string;
    };
};

const CLIENT_ID = 'com.stremio.services';

const useAppleLogin = (): [() => Promise<AppleLoginResponse>, () => void] => {
    const started = useRef(false);

    const start = useCallback((): Promise<AppleLoginResponse> => {
        return new Promise((resolve, reject) => {
            if (typeof window.AppleID === 'undefined') {
                reject(new Error('Apple Sign-In not loaded'));
                return;
            }

            if (started.current) {
                reject(new Error('Apple login already in progress'));
                return;
            }

            started.current = true;

            window.AppleID.auth.init({
                clientId: CLIENT_ID,
                scope: 'name email',
                redirectURI: 'https://www.stremio.com/login',
                state: 'signin',
                usePopup: true,
            });

            window.AppleID.auth
                .signIn()
                .then((response: AppleSignInResponse) => {
                    if (response.authorization) {
                        console.log('Apple Sign-In response:', response); // eslint-disable-line no-console
                        const email = response.email || '';
                        const sub = response.authorizedData.userId;

                        let name = '';
                        if (response.fullName) {
                            const firstName = response.fullName.firstName || '';
                            const lastName = response.fullName.lastName || '';
                            name = [firstName, lastName].filter(Boolean).join(' ');
                        }

                        if (!sub) {
                            reject(new Error('No sub token received from Apple'));
                            return;
                        }

                        resolve({
                            token: response.authorization.id_token,
                            sub: sub,
                            email: email,
                            name: name,
                        });
                    } else {
                        reject(new Error('No authorization received from Apple'));
                    }
                })
                .catch((error: Error) => {
                    console.error('Error during Apple Sign-In:', error);
                    reject(error);
                })
                .finally(() => {
                    started.current = false;
                });
        });
    }, []);

    const stop = useCallback(() => {
        started.current = false;
    }, []);

    return [start, stop];
};

export default useAppleLogin;
