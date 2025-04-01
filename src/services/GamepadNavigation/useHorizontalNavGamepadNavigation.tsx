// Copyright (C) 2017-2025 Smart code 203358507

import { useEffect } from 'react';
import { useGamepad } from '../GamepadContext';
import useFullscreen from 'stremio/common/useFullscreen';

const useHorizontalNavGamepadNavigation = (gamepadHandlerId: string, enableGoBack: boolean) => {
    const gamepad = useGamepad();
    const [fullscreen,,,toggleFullscreen] = useFullscreen();

    useEffect(() => {
        const goBack = () => enableGoBack && window.history.back();

        gamepad?.on('buttonY', gamepadHandlerId, toggleFullscreen as () => void);
        gamepad?.on('buttonB', gamepadHandlerId, goBack);

        return () => {
            gamepad?.off('buttonY', gamepadHandlerId);
            gamepad?.off('buttonB', gamepadHandlerId);
        };
    }, [gamepad, gamepadHandlerId, enableGoBack, fullscreen]);
};

export default useHorizontalNavGamepadNavigation;
