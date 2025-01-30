// Copyright (C) 2017-2024 Smart code 203358507

import { RefObject, useEffect } from 'react';

const useOutsideClick = (ref: RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
        if (!ref?.current) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('touchstart', handleClickOutside, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [ref, callback]);
};

export default useOutsideClick;
