// Copyright (C) 2017-2025 Smart code 203358507

import React from 'react';
import { Routes as RRoutes, Route as RRoute, useLocation, useNavigate } from 'react-router';
import { routerPaths } from 'stremio/common/routerPaths';
import Route from '../Route/Route';
import { useProfile } from 'stremio/common';

const Routes = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const profile = useProfile();
    const previousAuthRef = React.useRef(profile.auth);

    React.useEffect(() => {
        if (previousAuthRef.current !== null && profile.auth === null) {
            previousAuthRef.current = profile.auth;
            navigate('/intro', { replace: true });
        }
    }, [profile]);

    /**
     * Replaced onRouteChange with following useEffect:
     */
    React.useEffect(() => {
        if (profile.auth !== null && location.pathname === '/intro') {
            navigate('/', { replace: true });
        }
    }, [location, profile.auth, navigate]);

    const routes = routerPaths.map((route) =>
        <RRoute key={route.path} path={route.path} element={<Route component={route.element} />} />
    );

    return <RRoutes location={location}>
        {routes}
    </RRoutes>;
};

export default Routes;
