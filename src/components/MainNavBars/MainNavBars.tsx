// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo, useEffect } from 'react';
import classnames from 'classnames';
import { VerticalNavBar, HorizontalNavBar } from 'stremio/components/NavBar';
import styles from './MainNavBars.less';
import { useGamepad, useVerticalSpatialNavigation } from 'stremio/services';

const TABS = [
    { id: 'board', label: 'Board', icon: 'home', href: '#/' },
    { id: 'discover', label: 'Discover', icon: 'discover', href: '#/discover' },
    { id: 'library', label: 'Library', icon: 'library', href: '#/library' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '#/calendar' },
    { id: 'addons', label: 'ADDONS', icon: 'addons', href: '#/addons' },
    { id: 'settings', label: 'SETTINGS', icon: 'settings', href: '#/settings' },
];

type Props = {
    className: string,
    route?: string,
    query?: string,
    children?: React.ReactNode,
};

const GAMEPAD_HANDLER_ID = 'vertical-nav';

const MainNavBars = memo(({ className, route, query, children }: Props) => {
    const navRef = React.useRef(null);

    useVerticalSpatialNavigation(navRef, GAMEPAD_HANDLER_ID);

    return (
        <div className={classnames(className, styles['main-nav-bars-container'])}>
            <HorizontalNavBar
                className={styles['horizontal-nav-bar']}
                route={route}
                query={query}
                backButton={false}
                searchBar={true}
                fullscreenButton={true}
                navMenu={true}
            />
            <VerticalNavBar
                ref={navRef}
                className={styles['vertical-nav-bar']}
                selected={route}
                tabs={TABS}
            />
            <div className={styles['nav-content-container']}>{children}</div>
        </div>
    );
});

export default MainNavBars;

