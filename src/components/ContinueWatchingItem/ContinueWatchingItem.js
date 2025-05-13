// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useNavigate } = require('react-router');
const PropTypes = require('prop-types');
const { useServices } = require('stremio/services');
const LibItem = require('stremio/components/LibItem');

const ContinueWatchingItem = ({ _id, notifications, deepLinks, ...props }) => {
    const { core } = useServices();
    const navigate = useNavigate();

    const onClick = React.useCallback(() => {
        if (deepLinks?.metaDetailsVideos ?? deepLinks?.metaDetailsStreams) {
            // TODO - remove # from deeplinks in core if possible
            const navigateTo = deepLinks?.metaDetailsVideos ?? deepLinks?.metaDetailsStreams
            navigate(navigateTo.replace('#', ''));
        }
    }, [deepLinks]);

    const onPlayClick = React.useCallback((event) => {
        event.stopPropagation();
        if (deepLinks?.player ?? deepLinks?.metaDetailsStreams ?? deepLinks?.metaDetailsVideos) {
            const navigateTo = deepLinks?.player ?? deepLinks?.metaDetailsStreams ?? deepLinks?.metaDetailsVideos
            navigate(navigateTo.replace('#', ''));
        }
    }, [deepLinks]);

    const onDismissClick = React.useCallback((event) => {
        event.stopPropagation();
        if (typeof _id === 'string') {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'RewindLibraryItem',
                    args: _id
                }
            });
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'DismissNotificationItem',
                    args: _id
                }
            });
        }
    }, [_id]);

    return (
        <LibItem
            {...props}
            _id={_id}
            posterChangeCursor={true}
            notifications={notifications}
            onClick={onClick}
            onPlayClick={onPlayClick}
            onDismissClick={onDismissClick}
        />
    );
};

ContinueWatchingItem.propTypes = {
    _id: PropTypes.string,
    notifications: PropTypes.object,
    deepLinks: PropTypes.shape({
        metaDetailsVideos: PropTypes.string,
        metaDetailsStreams: PropTypes.string,
        player: PropTypes.string
    }),
};

module.exports = ContinueWatchingItem;
