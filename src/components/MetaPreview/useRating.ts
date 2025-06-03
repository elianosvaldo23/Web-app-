import { useMemo, useCallback } from 'react';
import { useServices } from 'stremio/services';

const useRating = (metaDetails: MetaDetails) => {
    const { core } = useServices();

    const like = useMemo(() => {
        return metaDetails.like !== null && metaDetails.like.type === 'Ready' ? metaDetails.like.content : null;
    }, [metaDetails.like]);
    const setRating = useCallback(
        (status: string) => {
            if (!metaDetails.metaItem || !metaDetails.metaItem.content) {
                return;
            }
            core.transport.dispatch({
                action: 'MetaDetails',
                args: {
                    action: 'Rate',
                    args: {
                        id: metaDetails?.metaItem.content.content?.id,
                        status: status,
                    },
                },
            });
        },
        [metaDetails],
    );

    const onLiked = () => {
        setRating(like === 'liked' ? null : 'liked');
    };

    const onLoved = () => {
        setRating(like === 'loved' ? null : 'loved');
    };

    return {
        onLiked,
        onLoved,
        like,
    };
};

export default useRating;
