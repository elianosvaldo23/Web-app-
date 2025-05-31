// Copyright (C) 2017-2023 Smart code 203358507

import { useCallback, useEffect, useState } from 'react';
import useSettings from './useSettings';

const useFullscreen = () => {
    const [settings] = useSettings();
    const [fullscreen, setFullscreen] = useState(false);

    const requestFullscreen = useCallback(() => {
        if (document.fullscreenElement !== document.documentElement) {
            document.documentElement.requestFullscreen();
        }
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement === document.documentElement) {
            document.exitFullscreen();
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        fullscreen ? exitFullscreen() : requestFullscreen();
    }, [fullscreen]);

    useEffect(() => {
        const onFullscreenChange = () => {
            setFullscreen(document.fullscreenElement === document.documentElement);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Escape' && settings.escExitFullscreen) {
                exitFullscreen();
            }

            if (event.code === 'KeyF') {
                toggleFullscreen();
            }

            if (event.code === 'F11') {
                toggleFullscreen();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, [settings.escExitFullscreen, toggleFullscreen]);

    return [fullscreen, requestFullscreen, exitFullscreen, toggleFullscreen];
};

export default useFullscreen;
