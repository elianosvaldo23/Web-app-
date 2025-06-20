import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

type Props = {
    children: JSX.Element,
    when: boolean,
    name: string,
    onTransitionEnd?: () => void
};

const Transition = ({ children, when, name, onTransitionEnd }: Props) => {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [mounted, setMounted] = useState(false);

    const [state, setState] = useState('enter');
    const [active, setActive] = useState(false);

    const callbackRef = useCallback((element: HTMLElement | null) => {
        setElement(element);
    }, []);

    const className = useMemo(() => {
        const animationClass = `${name}-${state}`;
        const activeClass = active ? `${name}-active` : null;

        return children && classNames(
            children.props.className,
            animationClass,
            activeClass,
        );
    }, [name, state, active, children]);

    const handleTransitionEnd = useCallback(() => {
        switch (state) {
            case 'enter':
                onTransitionEnd?.();
                break;
            case 'exit':
                setMounted(false);
                break;
        }
    }, [state]);

    useEffect(() => {
        setState(when ? 'enter' : 'exit');
        when && setMounted(true);
    }, [when]);

    useEffect(() => {
        requestAnimationFrame(() => {
            setActive(!!element);
        });
    }, [element]);

    useEffect(() => {
        element?.addEventListener('transitionend', handleTransitionEnd);
        return () => element?.removeEventListener('transitionend', handleTransitionEnd);
    }, [element, onTransitionEnd]);

    return (
        mounted && cloneElement(children, {
            ref: callbackRef,
            className,
        })
    );
};

export default Transition;
