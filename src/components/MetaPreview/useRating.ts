import { useMemo, useCallback } from 'react';
import { useServices } from 'stremio/services';

const useRating = (metaDetails: MetaDetails) => {
    if (!metaDetails) {
        return {
            onLiked: () => {},
            onLoved: () => {},
        };
    }
    const { core } = useServices();

    const like = useMemo(() => {
        return metaDetails.like?.type === 'Ready' ? metaDetails.like.content : null;
    }, [metaDetails.like]);

    const setRating = useCallback((status: LoadableError | null) => {
        const metaId = metaDetails.metaItem?.content?.content?.id;
        if (!metaId) return;

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
    }, [metaDetails.metaItem?.content?.content?.id]);

    const onLiked = useCallback(() => {
        setRating(like === 'liked' ? null : 'liked');
    }, [like, setRating]);

    const onLoved = useCallback(() => {
        setRating(like === 'loved' ? null : 'loved');
    }, [like, setRating]);

    return {
        onLiked,
        onLoved,
        like,
    };
};

export default useRating;
