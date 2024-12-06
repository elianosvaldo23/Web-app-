import React from 'react';
import MetaPreview from 'stremio/common/MetaPreview/MetaPreview';
import Video from '../../MetaDetails/VideosList/Video/Video';
import styles from './SideDrawer.less';
import classNames from 'classnames';
import { CONSTANTS } from 'stremio/common';
import SeasonsBar from 'stremio/routes/MetaDetails/VideosList/SeasonsBar';

type Props = {
    seriesInfo: any;
    metaItem: MetaItem;
    className?: string;
    closeSideBar: () => void;
    sideDrawerOpen: boolean;
};

const SideDrawer = ({ seriesInfo, className, closeSideBar, sideDrawerOpen, ...props }: Props) => {
    const [season, setSeason] = React.useState<number>(seriesInfo?.season);
    const metaItem = React.useMemo(() => {
        return props.metaItem !== null && Array.isArray(props.metaItem.videos) && seriesInfo ?
            {
                ...props.metaItem,
                links: props.metaItem.links.filter(({ category }) => category === CONSTANTS.SHARE_LINK_CATEGORY)
            }
            :
            props.metaItem;
    }, [props.metaItem]);
    const videos = React.useMemo(() => {
        return props.metaItem && Array.isArray(props.metaItem.videos) ?
            props.metaItem.videos.filter((video) => video.season === season)
            :
            props.metaItem.videos;
    }, [props.metaItem, season]);
    const seasons = React.useMemo(() => {
        return props.metaItem && props.metaItem.videos
            .map(({ season }) => season)
            .filter((season, index, seasons) => {
                return season !== null && season !== undefined &&
                    !isNaN(season) &&
                    typeof season === 'number' &&
                    seasons.indexOf(season) === index;
            })
            .sort((a, b) => (a || Number.MAX_SAFE_INTEGER) - (b || Number.MAX_SAFE_INTEGER));
    }, [props.metaItem.videos]);

    const seasonOnSelect = React.useCallback((event: { value: string }) => {
        setSeason(parseInt(event.value));
    }, []);

    return (
        <>
            <div className={classNames(styles['overlay'], { [styles['open']]: sideDrawerOpen })} onClick={closeSideBar} />
            <div className={classNames(styles['side-drawer'], className)}>
                <div className={styles['info']}>
                    {
                        metaItem !== null ?
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
                            :
                            null
                    }
                </div>
                {
                    videos !== null && seriesInfo ?
                        <>
                            <SeasonsBar
                                season={season}
                                seasons={seasons}
                                onSelect={seasonOnSelect}
                            />
                            <div className={styles['content']}>
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
                                    />
                                ))}
                            </div>
                        </>
                        : null
                }

            </div>
        </>
    );
};

export default SideDrawer;
