// Copyright (C) 2017-2024 Smart code 203358507

import React, { BaseSyntheticEvent } from 'react';
import classNames from 'classnames';
import Icon from '@stremio/stremio-icons/react';
import styles from './SideDrawerButton.less';

type Props = {
    className: string,
    onClick: () => void,
    onContextMenu: () => void,
    onTouchStart: (event: BaseSyntheticEvent) => void,
    onTouchEnd: () => void,
};

const SideDrawerButton = ({ className, onClick, onContextMenu, onTouchStart, onTouchEnd }: Props) => {
    return (
        <div className={classNames(className, styles['side-drawer-button'])} onClick={onClick} onContextMenu={onContextMenu} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Icon name={'chevron-back'} className={styles['icon']} />
        </div>
    );
};

export default SideDrawerButton;
