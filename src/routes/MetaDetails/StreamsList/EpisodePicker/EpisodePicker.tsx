// Copyright (C) 2017-2025 Smart code 203358507

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, NumberInput } from 'stremio/components';
import styles from './EpisodePicker.less';

type Props = {
    className?: string,
    seriesId: string;
    onSubmit: (season: number, episode: number) => void;
};
export const EpisodePicker = ({ className, onSubmit }: Props) => {
    const { t } = useTranslation();
    const splitPath = window.location.hash.split('/');
    const videoId = decodeURIComponent(splitPath[splitPath.length - 1]);
    const [initialSeason, initialEpisode] = React.useMemo(() => {
        const [, pathSeason, pathEpisode] = videoId ? videoId.split(':') : [];
        const initialSeason = isNaN(parseInt(pathSeason)) ? 1 : parseInt(pathSeason);
        const initialEpisode = isNaN(parseInt(pathEpisode)) ? 1 : parseInt(pathEpisode);
        return [initialSeason, initialEpisode];
    }, [videoId]);
    const seasonRef = useRef<HTMLInputElement>(null);
    const episodeRef = useRef<HTMLInputElement>(null);

    const handleSubmit = React.useCallback(() => {
        const season = parseInt(seasonRef.current?.value || '1');
        const episode = parseInt(episodeRef.current?.value || '1');
        if (typeof onSubmit === 'function' && !isNaN(season) && !isNaN(episode)) {
            onSubmit(season, episode);
        }
    }, [onSubmit, seasonRef, episodeRef]);

    return <div className={className}>
        <NumberInput ref={seasonRef} min={0} label={t('SEASON')} defaultValue={initialSeason} showButtons />
        <NumberInput ref={episodeRef} min={1} label={t('EPISODE')} defaultValue={initialEpisode} showButtons />
        <Button className={styles['button-container']} onClick={handleSubmit}>{t('SIDEBAR_SHOW_STREAMS')}</Button>
    </div>;
};

export default EpisodePicker;
