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

    const handleIncrease = () => {
        const { max } = props;
        if (max !== undefined) {
            return setValue((prevVal) => {
                const value = prevVal || 0;
                return value + 1 > max ? max : value + 1;
            });
        }
        setValue((prevVal) => {
            const value = prevVal || 0;
            return value + 1;
        });
    };

    const handleDecrease = () => {
        const { min } = props;
        if (min !== undefined) {
            return setValue((prevVal) => {
                const value = prevVal || 0;
                return value - 1 < min ? min : value - 1;
            });
        }
        setValue((prevVal) => {
            const value = prevVal || 0;
            return value - 1;
        });
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const min = props.min || 0;
        let newValue = event.target.valueAsNumber;
        if (newValue && newValue < min) {
            newValue = min;
        }
        if (props.max !== undefined && newValue && newValue > props.max) {
            newValue = props.max;
        }
        setValue(newValue);
    };

    useEffect(() => {
        if (typeof onUpdate === 'function') {
            onUpdate(value);
        }
    }, [value]);

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
            <div className={classnames(styles['number-display'], showButtons ? styles['buttons-container'] : '')}>
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
