// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { t } = require('i18next');
const { useServices } = require('stremio/services');
const { Image, SearchBar, Toggle, Video } = require('stremio/components');
const SeasonsBar = require('./SeasonsBar');
const styles = require('./styles');

const VideosList = ({ className, metaItem, libraryItem, season, seasonOnSelect, toggleNotifications }) => {
    const { core } = useServices();
    const [selectedEpisode, setSelectedEpisode] = React.useState(null);
    const showNotificationsToggle = React.useMemo(() => {
        return metaItem?.content?.content?.inLibrary && metaItem?.content?.content?.videos?.length;
    }, [metaItem]);
    const videos = React.useMemo(() => {
        return metaItem && metaItem.content.type === 'Ready' ?
            metaItem.content.content.videos
            :
            [];
    }, [metaItem]);
    const seasons = React.useMemo(() => {
        return [...new Set(videos.map(({ season }) => season))].map((season) => ({
            id: season,
            episodes: videos.filter(({ season: s }) => s === season).map(({ episode }) => episode)
        }))
            .sort((a, b) => (a.id || Number.MAX_SAFE_INTEGER) - (b.id || Number.MAX_SAFE_INTEGER));
    }, [videos]);
    const selectedSeason = React.useMemo(() => {
        const foundSeason = seasons.find(({ id }) => id === season);
        if (foundSeason) {
            return foundSeason;
        }

        const nonSpecialSeasons = seasons.filter(({ id }) => id !== 0);
        if (nonSpecialSeasons.length > 0) {
            return nonSpecialSeasons[nonSpecialSeasons.length - 1];
        }

        if (seasons.length > 0) {
            return seasons[seasons.length - 1];
        }

        return null;
    }, [seasons, season]);
    const videosForSeason = React.useMemo(() => {
        return videos
            .filter((video) => {
                return selectedSeason === null || video.season === selectedSeason.id;
            })
            .sort((a, b) => {
                return a.episode - b.episode;
            });
    }, [videos, selectedSeason]);
    const [search, setSearch] = React.useState('');
    const searchInputOnChange = React.useCallback((event) => {
        setSearch(event.currentTarget.value);
    }, []);

    const onMarkVideoAsWatched = (video, watched) => {
        core.transport.dispatch({
            action: 'MetaDetails',
            args: {
                action: 'MarkVideoAsWatched',
                args: [video, !watched]
            }
        });
    };

    const handleSelect = (event) => {
        if (!event.level) {
            seasonOnSelect(event);
        } else {
            setSelectedEpisode(event.value);
            const episode = videos.find(({ season: s, episode: e }) => s === season && e.toString() === event.value);
            if (episode.deepLinks) {
                if (typeof episode.deepLinks.player === 'string') {
                    window.location = episode.deepLinks.player;
                } else if (typeof episode.deepLinks.metaDetailsStreams === 'string') {
                    window.location.replace(episode.deepLinks.metaDetailsStreams);
                }
            }
        }
    };

    React.useEffect(() => {
        setSelectedEpisode(null);
    }, [season]);

    return (
        <div className={classnames(className, styles['videos-list-container'])}>
            {
                !metaItem || metaItem.content.type === 'Loading' ?
                    <React.Fragment>
                        <SeasonsBar.Placeholder className={styles['seasons-bar']} />
                        <SearchBar.Placeholder className={styles['search-bar']} title={t('SEARCH_VIDEOS')} />
                        <div className={styles['videos-scroll-container']}>
                            <Video.Placeholder />
                            <Video.Placeholder />
                            <Video.Placeholder />
                            <Video.Placeholder />
                            <Video.Placeholder />
                        </div>
                    </React.Fragment>
                    :
                    metaItem.content.type === 'Err' || videosForSeason.length === 0 ?
                        <div className={styles['message-container']}>
                            <Image className={styles['image']} src={require('/images/empty.png')} alt={' '} />
                            <div className={styles['label']}>No videos found for this meta!</div>
                        </div>
                        :
                        <React.Fragment>
                            {
                                showNotificationsToggle && libraryItem ?
                                    <Toggle className={styles['notifications-toggle']} checked={!libraryItem.state.noNotif} onClick={toggleNotifications}>
                                        {t('DETAIL_RECEIVE_NOTIF_SERIES')}
                                    </Toggle>
                                    :
                                    null
                            }
                            {
                                seasons.length > 0 ?
                                    <SeasonsBar
                                        className={styles['seasons-bar']}
                                        season={selectedSeason}
                                        episode={selectedEpisode}
                                        seasons={seasons}
                                        onSelect={handleSelect}
                                    />
                                    :
                                    null
                            }
                            <SearchBar
                                className={styles['search-bar']}
                                title={t('SEARCH_VIDEOS')}
                                value={search}
                                onChange={searchInputOnChange}
                            />
                            <div className={styles['videos-container']}>
                                {
                                    videosForSeason
                                        .filter((video) => {
                                            return search.length === 0 ||
                                                (
                                                    (typeof video.title === 'string' && video.title.toLowerCase().includes(search.toLowerCase())) ||
                                                    (!isNaN(video.released.getTime()) && video.released.toLocaleString(undefined, { year: '2-digit', month: 'short', day: 'numeric' }).toLowerCase().includes(search.toLowerCase()))
                                                );
                                        })
                                        .map((video, index) => (
                                            <Video
                                                key={index}
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
                                        ))
                                }
                            </div>
                        </React.Fragment>
            }
        </div>
    );
};

VideosList.propTypes = {
    className: PropTypes.string,
    metaItem: PropTypes.object,
    libraryItem: PropTypes.object,
    season: PropTypes.number,
    seasonOnSelect: PropTypes.func,
    toggleNotifications: PropTypes.func,
};

module.exports = VideosList;
