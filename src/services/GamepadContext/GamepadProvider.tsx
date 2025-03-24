import React, { useEffect, useRef, useState, useCallback } from 'react';
import GamepadContext from './GamepadContext';

type GamepadEventHandlers = Record<string, ((data?: any) => void)[]>;

const GamepadProvider: React.FC<{
    enabled: boolean;
    children: React.ReactNode;
}> = ({ enabled, children }) => {
    const [connectedGamepads, setConnectedGamepads] = useState<number>(0);
    const lastButtonState = useRef<number[]>([]);
    const lastButtonPressedTime = useRef<number>(0);
    const axisTimer = useRef<number>(0);
    const eventHandlers = useRef<GamepadEventHandlers>({});

    const on = useCallback((event: string, callback: (data?: any) => void) => {
        if (!eventHandlers.current[event]) {
            eventHandlers.current[event] = [];
        }
        eventHandlers.current[event].push(callback);
    }, []);

    const off = useCallback((event: string, callback: (data?: any) => void) => {
        if (eventHandlers.current[event]) {
            eventHandlers.current[event] = eventHandlers.current[event].filter(
                (cb) => cb !== callback
            );
        }
    }, []);

    const emit = (event: string, data?: any) => {
        if (eventHandlers.current[event]) {
            eventHandlers.current[event].forEach((callback) => callback(data));
        }
    };

    useEffect(() => {
        if (typeof navigator.getGamepads !== 'function') return;

        let animationFrameId: number;
        if (enabled) {

            const updateStatus = () => {
                if (document.hasFocus()) {
                    const currentTime = Date.now();
                    const controllers = Array.from(navigator.getGamepads()).filter(
                        (gp) => gp !== null
                    ) as Gamepad[];

                    if (controllers.length !== connectedGamepads) {
                        setConnectedGamepads(controllers.length);
                    }

                    controllers.forEach((controller, index) => {
                        const buttonsState = controller.buttons.reduce(
                            (buttons, button, i) => buttons | (button.pressed ? 1 << i : 0),
                            0
                        );

                        const processButton =
                            currentTime - lastButtonPressedTime.current > 250;
                        if (
                            lastButtonState.current[index] !== buttonsState ||
                            processButton
                        ) {
                            lastButtonPressedTime.current = currentTime;
                            lastButtonState.current[index] = buttonsState;

                            if (buttonsState & (1 << 0)) emit('buttonA');
                            if (buttonsState & (1 << 1)) emit('buttonB');
                            if (buttonsState & (1 << 2)) emit('buttonX');
                            if (buttonsState & (1 << 3)) emit('buttonY');
                            if (buttonsState & (1 << 4)) emit('buttonLT');
                            if (buttonsState & (1 << 5)) emit('buttonRT');
                        }

                        const deadZone = 0.05;
                        const maxSpeed = 100;
                        let axisHandled = false;

                        if (controller.axes[0] < -deadZone) {
                            if (
                                currentTime - axisTimer.current >
                                maxSpeed + (2000 - Math.abs(controller.axes[0]) * 2000)
                            ) {
                                emit('analog', 'left');
                                axisHandled = true;
                            }
                        }
                        if (controller.axes[0] > deadZone) {
                            if (
                                currentTime - axisTimer.current >
                                maxSpeed + (2000 - Math.abs(controller.axes[0]) * 2000)
                            ) {
                                emit('analog', 'right');
                                axisHandled = true;
                            }
                        }
                        if (controller.axes[1] < -deadZone) {
                            if (
                                currentTime - axisTimer.current >
                                maxSpeed + (2000 - Math.abs(controller.axes[1]) * 2000)
                            ) {
                                emit('analog', 'up');
                                axisHandled = true;
                            }
                        }
                        if (controller.axes[1] > deadZone) {
                            if (
                                currentTime - axisTimer.current >
                                maxSpeed + (2000 - Math.abs(controller.axes[1]) * 2000)
                            ) {
                                emit('analog', 'down');
                                axisHandled = true;
                            }
                        }

                        if (axisHandled) axisTimer.current = currentTime;
                    });
                }
                animationFrameId = requestAnimationFrame(updateStatus);
            };

            animationFrameId = requestAnimationFrame(updateStatus);
        }

        return () => {
            if (enabled) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [connectedGamepads, enabled]);

    return (
        <GamepadContext.Provider value={{ on, off }}>
            {children}
        </GamepadContext.Provider>
    );
};

export default GamepadProvider;
