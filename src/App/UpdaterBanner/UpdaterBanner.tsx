import React, { useEffect } from 'react';
import { useServices } from 'stremio/services';
import { useBinaryState } from 'stremio/common';
import { Button, Transition } from 'stremio/components';
import styles from './UpdaterBanner.less';
import classNames from 'classnames';

type Props = {
    className: string,
};

const UpdaterBanner = ({ className }: Props) => {
    const { shell } = useServices();
    const [visible, show, hide] = useBinaryState(false);

    const onInstallClick = () => {
        shell.transport && shell.transport.send('autoupdater-notif-clicked');
    };

    useEffect(() => {
        shell.on('autoupdater-show-notif', show);

        return () => {
            shell.off('autoupdater-show-notif', show);
        };
    });

    return (
        <div className={className}>
            <Transition when={visible} name={'slide-up'}>
                <div className={styles['updater-banner']}>
                    <div className={styles['label']}>
                        A new version of Stremio is available
                    </div>
                    <div className={styles['buttons']}>
                        <Button className={styles['button']} onClick={hide}>
                            Dismiss
                        </Button>
                        <Button className={classNames(styles['button'], styles['suggested'])} onClick={onInstallClick}>
                            Install now
                        </Button>
                    </div>
                </div>
            </Transition>
        </div>
    );
};

export default UpdaterBanner;
