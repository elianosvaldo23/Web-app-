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
export const EpisodePicker = ({ className, seriesId, onSubmit }: Props) => {
    const { t } = useTranslation();
    const [initialSeason, initialEpisode] = React.useMemo(() => {
        const [, season, episode] = seriesId ? seriesId.split(':') : [];
        return [parseInt(season || '1'), parseInt(episode || '1')];
    }, [seriesId]);
    const seasonRef = useRef(null);
    const episodeRef = useRef(null);

    const handleSubmit = React.useCallback(() => {
        const season = seasonRef.current?.value;
        const episode = episodeRef.current?.value;
        if (typeof onSubmit === 'function') onSubmit(season, episode);
    }, [onSubmit, seasonRef, episodeRef]);

    return <div className={className}>
        <NumberInput ref={seasonRef} min={1} label={t('SEASON')} defaultValue={initialSeason} showButtons />
        <NumberInput ref={episodeRef} min={1} label={t('EPISODE')} defaultValue={initialEpisode} showButtons />
        <Button className={styles['button-container']} onClick={handleSubmit}>{t('SIDEBAR_SHOW_STREAMS')}</Button>
    </div>;
};

export default EpisodePicker;
