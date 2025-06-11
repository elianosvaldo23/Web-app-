// Copyright (C) 2017-2025 Smart code 203358507

import { useMemo, useCallback } from 'react';
import { useServices } from 'stremio/services';

const useRating = (rating?: Rating) => {
    const { core } = useServices();

    const setRating = useCallback((status: 'liked' | 'loved' | null) => {
        core.transport.dispatch({
            action: 'MetaDetails',
            args: {
                action: 'Rate',
                args: status,
            },
        });
    }, []);

    const liked = useMemo(() => {
        return rating?.content === 'liked';
    }, [rating]);

    const loved = useMemo(() => {
        return rating?.content === 'loved';
    }, [rating]);

    const onLiked = useCallback(() => {
        setRating(rating?.content === 'liked' ? null : 'liked');
    }, [rating]);

    const onLoved = useCallback(() => {
        setRating(rating?.content === 'loved' ? null : 'loved');
    }, [rating]);

    return {
        onLiked,
        onLoved,
        liked,
        loved,
    };
};

export default useRating;
