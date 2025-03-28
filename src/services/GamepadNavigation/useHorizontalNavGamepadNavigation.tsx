import { useEffect } from 'react';
import { useGamepad } from '../GamepadContext';
import useFullscreen from 'stremio/common/useFullscreen';

const useHorizontalNavGamepadNavigation = (gamepadHandlerId: string, enableGoBack: boolean) => {
    const gamepad = useGamepad();
    const [fullscreen,,,toggleFullscreen] = useFullscreen();

    useEffect(() => {
        const goBack = () => enableGoBack && window.history.back();

        // @ts-ignore
        gamepad?.on('buttonY', gamepadHandlerId, toggleFullscreen);
        gamepad?.on('buttonB', gamepadHandlerId, goBack);

        return () => {
            gamepad?.off('buttonY', gamepadHandlerId);
            gamepad?.off('buttonB', gamepadHandlerId);
        };
    }, [gamepad, gamepadHandlerId, enableGoBack, fullscreen]);
};

export default useHorizontalNavGamepadNavigation;
