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

    /**
     * Replaced onRouteChange with following useEffect:
     */
    React.useEffect(() => {
        // Handle redirect if user logs out
        if (previousAuthRef.current !== null && profile.auth === null) {
            previousAuthRef.current = profile.auth;
            navigate('/intro', { replace: true });
        }

        // Handle redirect if user is logged in on intro screen
        if (profile.auth !== null && location.pathname === '/intro') {
            navigate('/', { replace: true });
        }
        previousAuthRef.current = profile.auth;
    }, [location, profile.auth, navigate, previousAuthRef.current]);

    const routes = routerPaths.map((route) =>
        <RRoute key={route.path} path={route.path} element={<Route component={route.element} />} />
    );

    return <RRoutes location={location}>
        {routes}
    </RRoutes>;
};

export default Routes;
