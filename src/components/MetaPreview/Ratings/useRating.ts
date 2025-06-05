// Copyright (C) 2017-2025 Smart code 203358507

import { useMemo, useCallback } from 'react';
import { useServices } from 'stremio/services';

type Like = {
    content: 'liked' | 'loved' | null;
    type: 'Ready' | 'Loading' | 'Error';
};

const useRating = (metaId?: string, like?: Like) => {
    const { core } = useServices();

    const setRating = useCallback((status: 'liked' | 'loved' | null) => {
        core.transport.dispatch({
            action: 'MetaDetails',
            args: {
                action: 'Rate',
                args: {
                    id: metaId,
                    status,
                },
            },
        });
    }, []);

    const liked = useMemo(() => {
        return like?.content === 'liked';
    }, [like]);

    const loved = useMemo(() => {
        return like?.content === 'loved';
    }, [like]);

    const onLiked = useCallback(() => {
        setRating(like?.content === 'liked' ? null : 'liked');
    }, [like]);

    const onLoved = useCallback(() => {
        setRating(like?.content === 'loved' ? null : 'loved');
    }, [like]);

    return {
        onLiked,
        onLoved,
        liked,
        loved,
    };
};

export default useRating;
