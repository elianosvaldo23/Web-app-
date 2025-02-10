// Copyright (C) 2017-2025 Smart code 203358507

import React, { ChangeEvent, forwardRef, useCallback, useState } from 'react';
import { type KeyboardEvent, type InputHTMLAttributes } from 'react';
import classnames from 'classnames';
import styles from './styles.less';
import Button from '../Button';
import Icon from '@stremio/stremio-icons/react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
    containerClassName?: string;
    className?: string;
    disabled?: boolean;
    showButtons?: boolean;
    defaultValue?: number;
    label?: string;
    min?: number;
    max?: number;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onSubmit?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

const NumberInput = forwardRef<HTMLInputElement, Props>(({ defaultValue, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue || 0);
    const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        props.onKeyDown && props.onKeyDown(event);

        if (event.key === 'Enter' ) {
            props.onSubmit && props.onSubmit(event);
        }
    }, [props.onKeyDown, props.onSubmit]);

    const handleIncrease = () => {
        const { max } = props;
        if (typeof max !== 'undefined') {
            return setValue((prevVal) =>
                prevVal + 1 > max ? max : prevVal + 1
            );
        }
        setValue((prevVal) => prevVal + 1);
    };

    const handleDecrease = () => {
        const { min } = props;
        if (typeof min !== 'undefined') {
            return setValue((prevVal) =>
                prevVal - 1 < min ? min : prevVal - 1
            );
        }
        setValue((prevVal) => prevVal - 1);
    };

    return (
        <div className={classnames(props.containerClassName, styles['number-input'])}>
            {props.showButtons ? <Button
                className={styles['btn']}
                onClick={handleDecrease}
                disabled={props.disabled || (props.min !== undefined ? value <= props.min : false)}>
                <Icon className={styles['icon']} name={'remove'} />
            </Button> : null}
            <div className={classnames(styles['number-display'], props.showButtons ? styles['with-btns'] : '')}>
                {props.label && <div className={styles['label']}>{props.label}</div>}
                <input
                    ref={ref}
                    type="number"
                    tabIndex={0}
                    value={value}
                    {...props}
                    className={classnames(props.className, styles['value'], { 'disabled': props.disabled })}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(parseInt(event.target.value))}
                    onKeyDown={onKeyDown}
                />
            </div>
            {props.showButtons ? <Button
                className={styles['btn']} onClick={handleIncrease} disabled={props.disabled || (props.max !== undefined ? value >= props.max : false)}>
                <Icon className={styles['icon']} name={'add'} />
            </Button> : null}
        </div>
    );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
