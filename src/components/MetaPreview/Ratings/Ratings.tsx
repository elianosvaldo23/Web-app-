// Copyright (C) 2017-2025 Smart code 203358507

import React from 'react';
import useRating from './useRating';
import styles from './Ratings.less';
import Icon from '@stremio/stremio-icons/react';
import classNames from 'classnames';

type Like = {
    content: 'liked' | 'loved';
    type: 'Ready' | 'Loading' | 'Error';
};

type Props = {
    metaId?: string;
    like?: Like;
    className?: string;
};

const Ratings = ({ metaId, like, className }: Props) => {
    const { onLiked, onLoved, liked, loved } = useRating(metaId, like);

    return (
        <div className={classNames(styles['ratings-container'], className)}>
            <div className={styles['icon-container']} onClick={onLiked}>
                <Icon name={'thumbs-up'} className={classNames(styles['icon'], { [styles['active']]: liked })} />
            </div>
            <div className={styles['icon-container']} onClick={onLoved}>
                <Icon name={'heart'} className={classNames(styles['icon'], { [styles['active']]: loved })} />
            </div>
        </div>
    );
};

export default Ratings;
