// Copyright (C) 2017-2024 Smart code 203358507

import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from 'stremio/components';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Option from './Option';
import Icon from '@stremio/stremio-icons/react';
import styles from './Dropdown.less';

type Props = {
    options: MultiselectMenuOption[];
    value?: any;
    menuOpen: boolean | (() => void);
    level: number;
    setLevel: (level: number) => void;
    onSelect: (value: any) => void;
};




const REVERSE_LANG_CODE_MAP: {[key:string]:string} = {
    'ar': 'ara',
    'bg': 'bul',
    'bn': 'ben',
    'ca': 'cat',
    'cs': 'ces',
    'da': 'dan',
    'de': 'deu',
    'el': 'ell',
    'en': 'eng',
    'eo': 'epo',
    'es': 'spa',
    'eu': 'eus',
    'fa': 'fas',
    'fr': 'fre',
    'he': 'heb',
    'hi': 'hin',
    'hr': 'hrv',
    'hu': 'hun',
    'id': 'ind',
    'it': 'ita',
    'ja': 'jpn',
    'ko': 'kor',
    'mk': 'mkd',
    'my': 'mya',
    'nb': 'nob',
    'nl': 'nld',
    'nn': 'nno',
    'pl': 'pol',
    'pt': 'por',
    'ru': 'rus',
    'sv': 'swe',
    'sl': 'slv',
    'sr': 'srp',
    'te': 'tel',
    'tr': 'tur',
    'uk': 'ukr',
    'vi': 'vie',
    'zh': 'zho'
};

const fourToThreeLangCodeMap = (x:string):string =>{
    const result = REVERSE_LANG_CODE_MAP[x.split('-')[0]];
    if(!result){
        throw new Error(`Unkwown 4-Letter-Lang code: ${x}`);
    }
    return result;
}

// Usage: O(1) lookup

const Dropdown = ({ level, setLevel, options, onSelect, value, menuOpen }: Props) => {
    const { t } = useTranslation();
    const optionsRef = useRef(new Map());
    const containerRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSetOptionRef = useCallback((optionValue: any) => (node: HTMLButtonElement | null) => {
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
                        
                        const fourLetterUserLocale = navigator.language || 'en-US';
                        const threeLetterUserLocale:string = fourToThreeLangCodeMap(fourLetterUserLocale) || 'eng';                         
                        
                        const getPriority = (option: MultiselectMenuOption) => {
                            
                            const value2 = String(option.value);

                            const value = value2.length == 3 ? value2 : (fourToThreeLangCodeMap(fourLetterUserLocale) || 'eng');

                            // Check if the value matches user's language, if yes put at top of list
                            if (value === threeLetterUserLocale) return 1;

                            
                            // Check if it's English, put at the second position
                            if (value == 'eng') return 2;
                            
                            return 3; // Everything else
                        };
                        
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
                    key={`${String(option.label)}-${String(option.value)}`}
                    className={String(option.label) === 'English' ? styles['separator-after'] : ''}>
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
