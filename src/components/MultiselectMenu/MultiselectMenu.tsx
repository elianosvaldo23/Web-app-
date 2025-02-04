// Copyright (C) 2017-2024 Smart code 203358507

import React, { useEffect } from 'react';
import { Button } from 'stremio/components';
import useBinaryState from 'stremio/common/useBinaryState';
import Dropdown from './Dropdown';
import classNames from 'classnames';
import Icon from '@stremio/stremio-icons/react';
import styles from './MultiselectMenu.less';
import useOutsideClick from 'stremio/common/useOutsideClick';

type Props = {
    className?: string,
    title?: string;
    subtitle?: string;
    options: MultiselectMenuOption[];
    selectedOption?: MultiselectMenuOption;
    onSelect: (level: number, value: number) => void;
};

const MultiselectMenu = ({ className, title, subtitle, options, selectedOption, onSelect }: Props) => {
    const [menuOpen, , closeMenu, toggleMenu] = useBinaryState(false);
    const multiselectMenuRef = useOutsideClick(() => closeMenu());
    const [level, setLevel] = React.useState<number>(0);
    const [levelOptions, setLevelOptions] = React.useState<MultiselectMenuOption[]>([]);

    const onOptionSelect = (value: number) => {
        if (!level) {
            setLevel(level + 1);
        }
        onSelect(level, value);
    };

    useEffect(() => {
        if (level) {
            setLevelOptions(selectedOption?.options || []);
        } else {
            setLevelOptions(options);
        }
    }, [level]);

    useEffect(() => {
        if (!menuOpen) {
            setLevel(0);
        }
    }, [menuOpen]);

    return (
        <div className={classNames(styles['multiselect-menu'], className)} ref={multiselectMenuRef}>
            <Button
                className={classNames(styles['multiselect-button'], { [styles['open']]: menuOpen })}
                onClick={toggleMenu}
                tabIndex={0}
                aria-haspopup='listbox'
                aria-expanded={menuOpen}
            >
                <span>
                    <span>
                        {title}
                    </span>
                    {subtitle && <span>
                        {subtitle}
                    </span>}
                </span>
                <Icon name={'caret-down'} className={classNames(styles['icon'], { [styles['open']]: menuOpen })} />
            </Button>
            {
                menuOpen ?
                    <Dropdown
                        level={level}
                        setLevel={setLevel}
                        options={levelOptions}
                        onSelect={onOptionSelect}
                        menuOpen={menuOpen}
                        selectedOption={!level ? selectedOption : undefined}
                    />
                    : null
            }
        </div>
    );
};

export default MultiselectMenu;
