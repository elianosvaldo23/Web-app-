// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { HashRouter } = require('react-router-dom');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Routes } = require('./Routes');

const Router = ({ className }) => {

    return (
        <div className={classnames(className, 'routes-container')}>
            <HashRouter>
                <Routes />
            </HashRouter>
        </div>
    );
};

Router.propTypes = {
    className: PropTypes.string,
};

module.exports = Router;
