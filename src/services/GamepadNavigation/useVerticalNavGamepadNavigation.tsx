import { useEffect } from 'react';
import { useGamepad } from '../GamepadContext';

const useVerticalGamepadNavigation = (sectionRef: React.RefObject<HTMLDivElement>, gamepadHandlerId: string) => {
    const gamepad = useGamepad();

    useEffect(() => {
        const focusableSelector = 'a';
        const focusableElements = () =>
            Array.from(sectionRef.current?.querySelectorAll(focusableSelector) || []);

        const moveFocus = (direction: 'prev' | 'next') => {
            const route = window.location.hash.replace('#/', '') || 'board';
            const elements = focusableElements();
            if (!elements.length || route !== gamepadHandlerId) return;

            const currentIndex = elements.findIndex((item) => item.classList.contains('selected'));

            let nextIndex = currentIndex;

            if (direction === 'next')
                nextIndex = (elements.length + currentIndex + 1) % elements.length;
            if (direction === 'prev')
                nextIndex = (elements.length + currentIndex - 1) % elements.length;

            elements[nextIndex]?.click();
        };

        const handleKeyDown = (event) => {
            if (!event.nativeEvent?.spatialNavigationPrevented) {
                switch (event.key) {
                    case 'Tab':
                        moveFocus('next');
                        break;
                    default:
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        gamepad?.on('buttonLT', gamepadHandlerId, () => moveFocus('prev'));
        gamepad?.on('buttonRT', gamepadHandlerId, () => moveFocus('next'));

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            gamepad?.off('buttonLT', gamepadHandlerId);
            gamepad?.off('buttonRT', gamepadHandlerId);
        };
    }, [gamepad, sectionRef]);
};

export default useVerticalGamepadNavigation;
