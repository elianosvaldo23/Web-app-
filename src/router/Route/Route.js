// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { ModalsContainerProvider } = require('../ModalsContainerContext');

const Route = ({ component }) => {
    return (
        <div className={'route-container'}>
            <ModalsContainerProvider>
                <div className={'route-content'}>
                    {component}
                </div>
            </ModalsContainerProvider>
        </div>
    );
};

Route.propTypes = {
    component: PropTypes.node
};

module.exports = Route;
