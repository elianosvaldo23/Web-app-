// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useSearchParams } = require('react-router-dom');

const useSeason = (urlParams) => {
    const [queryParams, setQueryParams] = useSearchParams();
    const season = React.useMemo(() => {
        return queryParams.has('season') && !isNaN(queryParams.get('season')) ?
            parseInt(queryParams.get('season'), 10)
            :
            null;
    }, [queryParams]);
    const setSeason = React.useCallback((season) => {
        const nextQueryParams = new URLSearchParams(queryParams);
        nextQueryParams.set('season', season);
        setQueryParams(nextQueryParams);
    }, [urlParams, queryParams]);
    return [season, setSeason];
};

module.exports = useSeason;
