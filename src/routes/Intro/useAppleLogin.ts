import { useCallback, useEffect, useRef } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';

type AppleLoginResponse = {
    token: string;
    sub: string;
    email: string;
    name: string;
};

type AppleSignInResponse = {
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
};

type CustomJWTPayload = JwtPayload & {
    email?: string;
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
                redirectURI: 'https://web.stremio.com/',
                state: 'signin',
                usePopup: true,
            });

            window.AppleID.auth.signIn().then((response: AppleSignInResponse) => {
                if (response.authorization) {
                    try {
                        const idToken = response.authorization.id_token;
                        const payload: CustomJWTPayload = jwtDecode(idToken);
                        const sub = payload.sub;
                        const email = payload.email ?? response.email ?? '';

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
                            token: idToken,
                            sub: sub,
                            email: email,
                            name: name,
                        });
                    } catch (error) {
                        reject(new Error(`Failed to parse id_token: ${error}`));
                    }
                } else {
                    reject(new Error('No authorization received from Apple'));
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }, []);

    const stop = useCallback(() => {
        started.current = false;
    }, []);

    useEffect(() => {
        return () => stop();
    }, []);

    return [start, stop];
};

export default useAppleLogin;
