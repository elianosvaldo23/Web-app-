// Copyright (C) 2017-2025 Smart code 203358507

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, NumberInput } from 'stremio/components';
import styles from './EpisodePicker.less';

type Props = {
    className?: string,
    seriesId: string;
    onSubmit: (season: number, episode: number) => void;
};

const EpisodePicker = ({ className, onSubmit }: Props) => {
    const { t } = useTranslation();
    const splitPath = window.location.hash.split('/');
    const videoId = decodeURIComponent(splitPath[splitPath.length - 1]);
    const [, pathSeason, pathEpisode] = videoId ? videoId.split(':') : [];
    const [season, setSeason] = React.useState(isNaN(parseInt(pathSeason)) ? 0 : parseInt(pathSeason));
    const [episode, setEpisode] = React.useState(isNaN(parseInt(pathEpisode)) ? 1 : parseInt(pathEpisode));
    const handleSeasonChange = (value: number) => setSeason(!isNaN(value) ? value : 0);

    const handleEpisodeChange = (value: number) => setEpisode(!isNaN(value) ? value : 1);

    const handleSubmit = React.useCallback(() => {
        if (typeof onSubmit === 'function' && !isNaN(season) && !isNaN(episode)) {
            onSubmit(season, episode);
        }
    }, [onSubmit, season, episode]);

    const disabled = React.useMemo(() => season === parseInt(pathSeason) && episode === parseInt(pathEpisode), [pathSeason, pathEpisode, season, episode]);

return (
        <div className={className}>
            <NumberInput min={0} label={t('SEASON')} defaultValue={season} onUpdate={handleSeasonChange} showButtons />
            <NumberInput min={1} label={t('EPISODE')} defaultValue={episode} onUpdate={handleEpisodeChange} showButtons />
            <Button className={styles['button-container']} onClick={handleSubmit} disabled={disabled}>
                <div className={styles['label']}>{t('SIDEBAR_SHOW_STREAMS')}</div>
            </Button>
        </div>
    );
};

export default EpisodePicker;
