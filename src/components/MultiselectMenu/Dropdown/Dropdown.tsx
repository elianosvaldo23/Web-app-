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

function getThreeLetterLangCode(localeCode: string): string {
    if (!interfaceLanguages || interfaceLanguages.length === 0) {
        console.warn('Interface languages are not defined or empty. Falling back to "eng".');
        return 'eng';
    }
    const language = interfaceLanguages.find(lang => lang.codes.includes(localeCode));
    if (!language) {
        console.warn(`Unknown language code: ${localeCode}. Falling back to 'eng'.`);
        return 'eng';
    }
    return language.codes[1];
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

    const navigatorLanguageFourLetterCode = navigator.language || 'en-US';
    const navigatorLanguageThreeLetterCode:string = getThreeLetterLangCode(navigatorLanguageFourLetterCode) || 'eng';

    const getPriority = (option: MultiselectMenuOption) => {
        if (!option || !option.value) {
            console.warn('Invalid option or option value:', option);    
            return 3;
        }
        const optionValue = String(option.value);
        const LangThreeLetterCode = optionValue.length === 3 ? optionValue : getThreeLetterLangCode(optionValue) || 'eng';

        if (LangThreeLetterCode === navigatorLanguageThreeLetterCode) return 1;
        if (LangThreeLetterCode === 'eng') return 2;
        if (LangThreeLetterCode === 'None') return 3;
        return 4;
    };

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

                {options
                    .filter((option: MultiselectMenuOption) => !option.hidden)
                    .sort((a, b) => {
                        
                        // Sort by priority first
                        const aPriority = getPriority(a);
                        const bPriority = getPriority(b);
                        
                        //Lowest number is ranked highest
                        if (aPriority !== bPriority) {
                            return aPriority - bPriority;
                        }
                       
                        // Same priority = alphabetical by label eg "english", "french"
                        return a.label.localeCompare(b.label);
                    })
                .map((option: MultiselectMenuOption) => (
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
                ))
            }
        </div>
    );
};

export default Dropdown;
