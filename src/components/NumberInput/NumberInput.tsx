// Copyright (C) 2017-2025 Smart code 203358507

import Icon from '@stremio/stremio-icons/react';
import React, { ChangeEvent, forwardRef, memo, useCallback, useMemo, useState } from 'react';
import { type KeyboardEvent, type InputHTMLAttributes } from 'react';
import classnames from 'classnames';
import styles from './NumberInput.less';
import Button from '../Button';

type Props = InputHTMLAttributes<HTMLInputElement> & {
    containerClassName?: string;
    className?: string;
    disabled?: boolean;
    showButtons?: boolean;
    label?: string;
    min?: number;
    max?: number;
    value?: number;
    defaultValue?: number;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onSubmit?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onUpdate?: (value: number) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const NumberInput = forwardRef<HTMLInputElement, Props>(({ defaultValue = 1, showButtons, onUpdate, onKeyDown, onSubmit, min, max, onChange, ...props }, ref) => {
    const [value, setValue] = useState(defaultValue);
    const displayValue = useMemo(() => props.value ?? value, [props.value, value]);
    
    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown && onKeyDown(event);

        if (event.key === 'Enter') {
            onSubmit && onSubmit(event);
        }
    }, [onKeyDown, onSubmit]);

    const handleValueChange = (value: number) => {
        if (props.value === undefined) {
            setValue(value);
        }
        onUpdate?.(value);
        onChange?.({ target: { value: value.toString() }} as ChangeEvent<HTMLInputElement>);
    };

    const handleIncrement = () => {
        handleValueChange(clampValueToRange((displayValue || 0) + 1));
    };

    const handleDecrement = () => {
        handleValueChange(clampValueToRange((displayValue || 0) - 1));
    };

    const clampValueToRange = (value: number): number => {
        const minValue = min ?? 0;
        
        if (value < minValue) {
            return minValue;
        }
        
        if (max !== undefined && value > max) {
            return max;
        }
        
        return value;
    };

    const handleInputChange = ({ target: { valueAsNumber }}: ChangeEvent<HTMLInputElement>) => {
        handleValueChange(clampValueToRange(valueAsNumber || 0));
    };

    return (
        <div className={classnames(props.containerClassName, styles['number-input'])}>
            {
                showButtons ?
                    <Button
                        className={styles['button']}
                        onClick={handleDecrement}
                        disabled={props.disabled || (min !== undefined ? displayValue <= min : false)}>
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
                    value={displayValue}
                    {...props}
                    className={classnames(props.className, styles['value'], { [styles.disabled]: props.disabled })}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {
                showButtons ?
                    <Button
                        className={styles['button']} onClick={handleIncrement} disabled={props.disabled || (max !== undefined ? displayValue >= max : false)}>
                        <Icon className={styles['icon']} name={'add'} />
                    </Button>
                    : null
            }
        </div>
    );
});

NumberInput.displayName = 'NumberInput';

export default memo(NumberInput);
