import React from 'react';
import { CONSTANTS } from 'stremio/common';
import MetaPreview from 'stremio/common/MetaPreview/MetaPreview';
import Video from 'stremio/common/Video/Video';
import SeasonsBar from 'stremio/routes/MetaDetails/VideosList/SeasonsBar';
import classNames from 'classnames';
import styles from './SideDrawer.less';
import { useServices } from 'stremio/services';

type Props = {
    seriesInfo: any;
    metaItem: MetaItem;
    className?: string;
    closeSideBar: () => void;
    sideDrawerOpen: boolean;
};

const SideDrawer = ({ seriesInfo, className, closeSideBar, sideDrawerOpen, ...props }: Props) => {
    const { core } = useServices();
    const [season, setSeason] = React.useState<number>(seriesInfo?.season);
    const metaItem = React.useMemo(() => {
        return seriesInfo ?
            {
                ...props.metaItem,
                links: props.metaItem.links.filter(({ category }) => category === CONSTANTS.SHARE_LINK_CATEGORY)
            }
            :
            props.metaItem;
    }, [props.metaItem]);
    const videos = React.useMemo(() => {
        return Array.isArray(metaItem.videos) ?
            metaItem.videos.filter((video) => video.season === season)
            :
            metaItem.videos;
    }, [metaItem, season]);
    const seasons = React.useMemo(() => {
        return props.metaItem.videos
            .map(({ season }) => season)
            .filter((season, index, seasons) => {
                return seasons.indexOf(season) === index;
            })
            .sort((a, b) => (a || Number.MAX_SAFE_INTEGER) - (b || Number.MAX_SAFE_INTEGER));
    }, [props.metaItem.videos]);

    const seasonOnSelect = React.useCallback((event: { value: string }) => {
        setSeason(parseInt(event.value));
    }, []);

    const onMarkVideoAsWatched = (video: Video, watched: boolean) => {
        core.transport.dispatch({
            action: 'Player',
            args: {
                action: 'MarkVideoAsWatched',
                args: [video, !watched]
            }
        });
    };

    return (
        <>
            <div className={classNames(styles['overlay'], { [styles['open']]: sideDrawerOpen })} onClick={closeSideBar} />
            {/* @ts-expect-error inert is not recognisable on div element; we need it to not focus the sideDrawer when closed */}
            <div className={classNames(styles['side-drawer'], className)} inert={!sideDrawerOpen ? '' : undefined}>
                <div className={styles['info']}>
                    <MetaPreview
                        compact={true}
                        name={metaItem.name}
                        logo={metaItem.logo}
                        runtime={metaItem.runtime}
                        releaseInfo={metaItem.releaseInfo}
                        released={metaItem.released}
                        description={metaItem.description}
                        links={metaItem.links}
                    />
                </div>
                {
                    seriesInfo ?
                        <div className={styles['content']}>
                            <SeasonsBar
                                season={season}
                                seasons={seasons}
                                onSelect={seasonOnSelect}
                            />
                            <div className={styles['videos']}>
                                {videos.map((video, index) => (
                                    <Video
                                        key={index}
                                        className={styles['video']}
                                        id={video.id}
                                        title={video.title}
                                        thumbnail={video.thumbnail}
                                        episode={video.episode}
                                        released={video.released}
                                        upcoming={video.upcoming}
                                        watched={video.watched}
                                        progress={video.progress}
                                        deepLinks={video.deepLinks}
                                        scheduled={video.scheduled}
                                        onMarkVideoAsWatched={onMarkVideoAsWatched}
                                    />
                                ))}
                            </div>
                        </div>
                        : null
                }

            </div>
        </>
    );
};

export default SideDrawer;
