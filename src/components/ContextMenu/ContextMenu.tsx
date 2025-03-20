import React, { memo, RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContextMenu.less';

type Props = {
    children: React.ReactNode,
    on: RefObject<HTMLElement>[],
    autoClose: boolean,
};

const ContextMenu = ({ children, on, autoClose }: Props) => {
    const [active, setActive] = useState(false);
    const [position, setPosition] = useState([0, 0]);
    const [containerSize, setContainerSize] = useState([0, 0]);

    const ref = useCallback((element: HTMLDivElement) => {
        element && setContainerSize([element.offsetWidth, element.offsetHeight]);
    }, []);

    const style = useMemo(() => {
        const [viewportWidth, viewportHeight] = [window.innerWidth, window.innerHeight];
        const [containerWidth, containerHeight] = containerSize;
        const [x, y] = position;

        const left = (x + containerWidth) > viewportWidth ? x - containerWidth : x;
        const top = (y + containerHeight) > viewportHeight ? y - containerHeight : y;

        return { top, left };
    }, [position, containerSize]);

    const close = () => {
        setPosition([0, 0]);
        setActive(false);
    };

    const stopPropagation = (event: React.MouseEvent | React.TouchEvent) => {
        event.stopPropagation();
    };

    const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        const { clientX, clientY } = event;

        setPosition([clientX, clientY]);
        setActive(true);
    };

    const onClick = useCallback(() => {
        autoClose && close();
    }, [autoClose]);

    useEffect(() => {
        on.forEach((ref) => ref.current && ref.current.addEventListener('contextmenu', onContextMenu));
        return () => on.forEach((ref) => ref.current && ref.current.removeEventListener('contextmenu', onContextMenu));
    }, [on]);

    return active && createPortal((
        <div
            className={styles['context-menu-container']}
            onMouseDown={close}
            onTouchStart={close}
        >
            <div
                ref={ref}
                className={styles['context-menu']}
                style={style}
                onMouseDown={stopPropagation}
                onTouchStart={stopPropagation}
                onClick={onClick}
            >
                {children}
            </div>
        </div>
    ), document.body);
};

export default memo(ContextMenu);
