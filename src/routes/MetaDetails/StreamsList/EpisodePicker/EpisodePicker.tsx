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
    const [, pathSeason, pathEpisode] = videoId ? videoId.split(':') : [];
    const [season, setSeason] = React.useState(() => {
        const initialSeason = isNaN(parseInt(pathSeason)) ? 1 : parseInt(pathSeason);
        return initialSeason;
    });
    const [episode, setEpisode] = React.useState(() => {
        const initialEpisode = isNaN(parseInt(pathEpisode)) ? 1 : parseInt(pathEpisode);
        return initialEpisode;
    });
    const seasonRef = useRef<HTMLInputElement>(null);
    const episodeRef = useRef<HTMLInputElement>(null);

    const handleSeasonChange = (value?: number) => setSeason(value !== undefined ? value : 1);

    const handleEpisodeChange = (value?: number) => setEpisode(value !== undefined ? value : 1);

    const handleSubmit = React.useCallback(() => {
        const season = parseInt(seasonRef.current?.value || '1');
        const episode = parseInt(episodeRef.current?.value || '1');
        if (typeof onSubmit === 'function' && !isNaN(season) && !isNaN(episode)) {
            onSubmit(season, episode);
        }
    }, [onSubmit, seasonRef, episodeRef]);

    const disabled = React.useMemo(() => season === parseInt(pathSeason) && episode === parseInt(pathEpisode), [pathSeason, pathEpisode, season, episode]);

    return <div className={className}>
        <NumberInput ref={seasonRef} min={0} label={t('SEASON')} defaultValue={season} onUpdate={handleSeasonChange} showButtons />
        <NumberInput ref={episodeRef} min={1} label={t('EPISODE')} defaultValue={episode} onUpdate={handleEpisodeChange} showButtons />
        <Button className={styles['button-container']} onClick={handleSubmit} disabled={disabled}>
            <div className={styles['label']}>{t('SIDEBAR_SHOW_STREAMS')}</div>
        </Button>
    </div>;
};

export default EpisodePicker;
