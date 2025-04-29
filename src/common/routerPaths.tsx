// Copyright (C) 2017-2025 Smart code 203358507

import React from 'react';
import routes from 'stremio/routes';

export const routerPaths = [
    {
        path: '/intro',
        element: <routes.Intro />,
    },
    {
        path: '/discover/:transportUrl?/:type?/:catalogId?',
        element: <routes.Discover />,
    },
    {
        path: '/library/:type?',
        element: <routes.Library />,
    },
    {
        path: '/calendar/:year?/:month?',
        element: <routes.Calendar />,
    },
    {
        path: '/continuewatching/:type?',
        element: <routes.Library />,
    },
    {
        path: '/search',
        element: <routes.Search />,
    },
    {
        path: '/metadetails/:type?/:id?/:videoId?',
        element: <routes.MetaDetails />,
    },
    {
        path: '/detail/:type?/:id?/:videoId?',
        element: <routes.MetaDetails />,
    },
    {
        path: '/addons/:type?/:transportUrl?/:catalogId?',
        element: <routes.Addons />,
    },
    {
        path: '/settings',
        element: <routes.Settings />,
    },
    {
        path: '/player/:stream?/:streamTransportUrl?/:metaTransportUrl?/:type?/:id?/:videoId?',
        element: <routes.Player />,
    },
    {
        path: '/',
        element: <routes.Board />,
    },
    {
        path: '*',
        element: <routes.NotFound />,
    },
];
