// Copyright (C) 2017-2025 Smart code 203358507

import Icon from '@stremio/stremio-icons/react';
import React, { ChangeEvent, forwardRef, useCallback, useEffect, useState } from 'react';
import { type KeyboardEvent, type InputHTMLAttributes } from 'react';
import classnames from 'classnames';
import styles from './NumberInput.less';
import Button from '../Button';

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
    onUpdate?: (value: number) => void;
};

const NumberInput = forwardRef<HTMLInputElement, Props>(({ defaultValue, showButtons, onUpdate, ...props }, ref) => {
    const [value, setValue] = useState<number>(defaultValue || 0);
    const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        props.onKeyDown && props.onKeyDown(event);

        if (event.key === 'Enter' ) {
            props.onSubmit && props.onSubmit(event);
        }
    }, [props.onKeyDown, props.onSubmit]);

    const updateValueAndNotify = (valueAsNumber: number) => {
        setValue(valueAsNumber);
        onUpdate?.(valueAsNumber);
    };

    const handleIncrease = () => {
        if (props.max !== undefined) {
            updateValueAndNotify(Math.min(props.max, (value || 0) + 1));
            return;
        }
        updateValueAndNotify((value || 0) + 1);
    };

    const handleDecrease = () => {
        if (props.min !== undefined) {
            updateValueAndNotify(Math.max(props.min, (value || 0) - 1));
            return;
        }
        updateValueAndNotify((value || 0) - 1);
    };

    const handleChange = ({ target: { valueAsNumber }}: ChangeEvent<HTMLInputElement>) => {
        const min = props.min || 0;
        if (valueAsNumber && valueAsNumber < min) {
            valueAsNumber = min;
        }
        if (props.max !== undefined && valueAsNumber && valueAsNumber > props.max) {
            valueAsNumber = props.max;
        }
        updateValueAndNotify(valueAsNumber);
    };

    return (
        <div className={classnames(props.containerClassName, styles['number-input'])}>
            {
                showButtons ?
                    <Button
                        className={styles['button']}
                        onClick={handleDecrease}
                        disabled={props.disabled || (props.min !== undefined ? value <= props.min : false)}>
                        <Icon className={styles['icon']} name={'remove'} />
                    </Button>
                    : null
            }
            <div className={classnames(styles['number-display'], { [styles['buttons-container']]: showButtons })}>
                {
                    props.label ?
                        <div className={styles['label']}>{props.label}</div>
                        : null
                }
                <input
                    ref={ref}
                    type={'number'}
                    tabIndex={0}
                    value={value}
                    {...props}
                    className={classnames(props.className, styles['value'], { 'disabled': props.disabled })}
                    onChange={handleChange}
                    onKeyDown={onKeyDown}
                />
            </div>
            {
                showButtons ?
                    <Button
                        className={styles['button']} onClick={handleIncrease} disabled={props.disabled || (props.max !== undefined ? value >= props.max : false)}>
                        <Icon className={styles['icon']} name={'add'} />
                    </Button>
                    : null
            }
        </div>
    );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
