// Copyright (C) 2017-2025 Smart code 203358507

import { useState, useEffect } from 'react';

type DeviceOrientationData = {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
    absolute: boolean | null;
    permissionGranted: boolean;
};

const useOrientation = () => {
    const [orientation, setOrientation] = useState<DeviceOrientationData>({
        alpha: null,
        beta: null,
        gamma: null,
        absolute: null,
        permissionGranted: false,
    });

    const requestPermission = async () => {
        if (
            typeof DeviceOrientationEvent !== 'undefined' &&
            (DeviceOrientationEvent as any).requestPermission
        ) {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    setOrientation((prev) => ({ ...prev, permissionGranted: true }));
                }
            } catch (error) {
                console.error('Error requesting DeviceOrientation permission:', error);
            }
        } else {
            setOrientation((prev) => ({ ...prev, permissionGranted: true }));
        }
    };

    useEffect(() => {
        const handleOrientationChange = (event: DeviceOrientationEvent) => {
            setOrientation((prev) => ({
                ...prev,
                alpha: event.alpha ?? null,
                beta: event.beta ?? null,
                gamma: event.gamma ?? null,
                absolute: event.absolute ?? null,
            }));
        };

        if (orientation.permissionGranted && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientationChange);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientationChange);
        };
    }, [orientation.permissionGranted]);

    return { ...orientation, requestPermission };
};

export default useOrientation;
