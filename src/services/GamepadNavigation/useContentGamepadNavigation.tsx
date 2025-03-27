import { useEffect } from 'react';
import { useGamepad } from '../GamepadContext';

const useContentGamepadNavigation = (
    sectionRef: React.RefObject<HTMLDivElement>,
    gamepadHandlerId: string
) => {
    const gamepad = useGamepad();

    useEffect(() => {
        const handleGamepadNavigation = (
            direction: 'left' | 'right' | 'up' | 'down'
        ) => {
            const elements = Array.from(
                sectionRef.current?.querySelectorAll<HTMLDivElement>('[tabindex="0"]') || []
            );
            if (elements.length === 0) return;

            const activeElement = sectionRef.current?.querySelector<HTMLDivElement>(':focus');

            if (!activeElement) {
                elements[0].focus();
                return;
            }

            const activeElementIndex = elements.indexOf(activeElement);
            let closestElement: HTMLDivElement | null = null;

            if (direction === 'left') {
                const prevIndex = activeElementIndex - 1 || 0;
                closestElement = elements[prevIndex];
            }
            if (direction === 'right') {
                const nextIndex = activeElementIndex + 1 > elements.length - 1 ? elements.length - 1 : activeElementIndex + 1;
                closestElement = elements[nextIndex];
            }

            if (direction === 'up' || direction === 'down') {
                const currentRect = activeElement.getBoundingClientRect();

                let closestDistance = Infinity;

                elements.forEach((el) => {
                    if (el === activeElement) return;
                    const rect = el.getBoundingClientRect();

                    let distance = Infinity;
                    switch (direction) {
                        case 'up':
                            if (
                                rect.bottom <= currentRect.top &&
                                (rect.left === currentRect.left ||
                                    (rect.left < currentRect.left && rect.right > currentRect.left)
                                )
                            ) {
                                distance = currentRect.top - rect.bottom;
                            }
                            break;
                        case 'down':
                            if (
                                rect.top >= currentRect.bottom &&
                                (rect.left === currentRect.left ||
                                    (rect.left < currentRect.left && rect.right > currentRect.left)
                                )
                            ) {
                                distance = rect.top - currentRect.bottom;
                            }
                            break;
                    }

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestElement = el;
                    }
                });
            }

            if (closestElement) {
                closestElement.focus();
            }
        };

        const onSelect = () => {
            const elements = Array.from(
                sectionRef.current?.querySelectorAll<HTMLDivElement>('[tabindex="0"]') || []
            );
            if (elements.length === 0) return;

            const activeElement = sectionRef.current?.querySelector<HTMLDivElement>(':focus');

            if (!activeElement) {
                elements[0].focus();
                return;
            }

            activeElement?.click();
        };

        gamepad?.on('analog', gamepadHandlerId, handleGamepadNavigation);
        gamepad?.on('buttonA', gamepadHandlerId, onSelect);

        return () => {
            gamepad?.off('analog', gamepadHandlerId);
            gamepad?.off('buttonA', gamepadHandlerId);
        };
    }, [gamepad, gamepadHandlerId, sectionRef]);
};

export default useContentGamepadNavigation;
