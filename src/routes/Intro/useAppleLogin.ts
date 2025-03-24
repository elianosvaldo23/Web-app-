import { useCallback, useRef } from 'react';

type AppleLoginResponse = {
    email: string;
    password: string;
};

type AppleSignInResponse = {
    authorization: {
        code: string;
        id_token: string;
        state: string;
    };
    user: string;
    email?: string;
};

const CLIENT_ID = 'com.stremio.one';

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
                redirectURI: window.location.origin,
                state: 'signin',
                usePopup: true
            });

            window.AppleID.auth.signIn()
                .then((response: AppleSignInResponse) => {
                    if (response.authorization) {
                        const userEmail = response.email || response.user;

                        if (!userEmail) {
                            reject(new Error('No email received from Apple'));
                            return;
                        }

                        resolve({
                            email: userEmail as string,
                            password: response.authorization.id_token
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
