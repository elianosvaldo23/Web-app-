// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { Image } = require('stremio/components');
const styles = require('./styles');

const BufferingLoader = ({ className, logo, onContextMenu }) => {
    return (
        <div className={classnames(className, styles['buffering-loader-container'])} onContextMenu={onContextMenu}>
            <Image
                className={styles['buffering-loader']}
                src={logo}
                alt={' '}
                fallbackSrc={require('/images/stremio_symbol.png')}
            />
        </div>
    );
};

BufferingLoader.propTypes = {
    className: PropTypes.string,
    logo: PropTypes.string,
    onContextMenu: PropTypes.func
};

module.exports = BufferingLoader;
