import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import { useServices } from 'stremio/services';
import { Button } from 'stremio/components';
import useProfile from 'stremio/common/useProfile';
import { withCoreSuspender } from 'stremio/common/CoreSuspender';
import styles from './styles.less';

type Props = {
    className?: string;
};

const StreamingServerWarning = ({ className }: Props) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const profile = useProfile();

    const createDate = (months: number, years: number): Date => {
        const date = new Date();
        if (months) date.setMonth(date.getMonth() + months);
        if (years) date.setFullYear(date.getFullYear() + years);
        return date;
    };

    const updateSettings = useCallback((warningDismissed: Date) => {
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UpdateSettings',
                args: {
                    ...profile.settings,
                    warningDismissed
                }
            }
        });
    }, [profile.settings]);

    const onLater = useCallback(() => {
        updateSettings(createDate(1, 0));
    }, [updateSettings]);

    const onDismiss = useCallback(() => {
        updateSettings(createDate(0, 50));
    }, [updateSettings]);

    return (
        <div className={classnames(className, styles['warning-container'])}>
            <div className={styles['warning-statement']}>
                {t('SETTINGS_SERVER_UNAVAILABLE')}
            </div>
            <div className={styles['actions']}>
                <a
                    href='https://www.stremio.com/download-service'
                    target='_blank'
                    rel='noreferrer'
                >
                    <Button
                        className={styles['action']}
                        title={t('SERVICE_INSTALL')}
                        tabIndex={-1}
                    >
                        <div className={styles['label']}>
                            {t('SERVICE_INSTALL')}
                        </div>
                    </Button>
                </a>
                <Button
                    className={styles['action']}
                    title={t('WARNING_STREAMING_SERVER_LATER')}
                    onClick={onLater}
                    tabIndex={-1}
                >
                    <div className={styles['label']}>
                        {t('WARNING_STREAMING_SERVER_LATER')}
                    </div>
                </Button>
                <Button
                    className={styles['action']}
                    title={t('DONT_SHOW_AGAIN')}
                    onClick={onDismiss}
                    tabIndex={-1}
                >
                    <div className={styles['label']}>
                        {t('DONT_SHOW_AGAIN')}
                    </div>
                </Button>
            </div>
        </div>
    );
};

export default withCoreSuspender(StreamingServerWarning);
