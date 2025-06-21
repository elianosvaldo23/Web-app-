// Copyright (C) 2017-2024 Smart code 203358507

import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from 'stremio/components';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Option from './Option';
import Icon from '@stremio/stremio-icons/react';
import styles from './Dropdown.less';
import interfaceLanguages from '../../../common/interfaceLanguages.json';

type Props = {
    options: MultiselectMenuOption[];
    value?: string | number;
    menuOpen: boolean | (() => void);
    level: number;
    setLevel: (level: number) => void;
    onSelect: (value: string | number) => void;
};

function normalizeLanguageCode(langCode: string): string {
    const language = interfaceLanguages.find((lang) => lang.codes.includes(langCode));
    if (!language) {
        console.warn(`Unknown language code: ${langCode}. Falling back to 'eng'.`);
        return 'eng';
    }
    return language.codes[1];
}

function getOptionLanguageCode(option: MultiselectMenuOption) {
    if (option.label === 'None') {
        return 'None';
    }
    if (!option || !option.value) {
        console.warn('Invalid option or option value:', option);
        return 'eng';
    }
    const optionValue = String(option.value);
    return optionValue.length === 3 ? optionValue : normalizeLanguageCode(optionValue) || 'eng';
}

const Dropdown = ({ level, setLevel, options, onSelect, value, menuOpen }: Props) => {
    const { t } = useTranslation();
    const optionsRef = useRef(new Map());
    const containerRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSetOptionRef = useCallback((optionValue: string | number) => (node: HTMLButtonElement | null) => {
        if (node) {
            optionsRef.current.set(optionValue, node);
        } else {
            optionsRef.current.delete(optionValue);
        }
    }, []);

    const handleBackClick = useCallback(() => {
        setLevel(level - 1);
    }, [setLevel, level]);

    useEffect(() => {
        if (menuOpen && selectedOption && containerRef.current) {
            const selectedNode = optionsRef.current.get(selectedOption.value);
            if (selectedNode) {
                selectedNode.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }
    }, [menuOpen, selectedOption]);

    const browserLocale = navigator.language || 'eng-US';
    const userLanguageCode = normalizeLanguageCode(browserLocale) || 'eng';

    const priorityLanguage = userLanguageCode === 'eng'
        ? ['eng', 'None']
        : [userLanguageCode, 'eng', 'None'];

    const isPriorityLanguage = (option: MultiselectMenuOption) => {
        return priorityLanguage.includes(getOptionLanguageCode(option));
    };

    const visibleOptions = options.filter((option: MultiselectMenuOption) => !option.hidden);

    const sortedOptions = [

        ...priorityLanguage.flatMap((lang) =>
            visibleOptions.filter((option) => getOptionLanguageCode(option) === lang)),

        ...visibleOptions
            .filter((option) => !isPriorityLanguage(option))
            .sort((a, b) => a.label.localeCompare(b.label))
    ];
    return (
        <div
            className={classNames(styles['dropdown'], { [styles['open']]: menuOpen })}
            role={'listbox'}
            ref={containerRef}
        >
            {level > 0 ?
                <Button className={styles['back-button']} onClick={handleBackClick}>
                    <Icon name={'caret-left'} className={styles['back-button-icon']} />
                    {t('BACK')}
                </Button>
                : null
            }

            {sortedOptions.map((option: MultiselectMenuOption) => (
                <div
                    key={`${String(option.label)}-${String(option.value)}`}>
                    <Option
                        key={option.value}
                        ref={handleSetOptionRef(option.value)}
                        option={option}
                        onSelect={onSelect}
                        selectedValue={value}
                    />
                </div>
            ))}
        </div>
    );
};

export default Dropdown;
