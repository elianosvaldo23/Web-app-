import React, { useMemo } from 'react';
import { Option, Section } from '../components';
import { useServices } from 'stremio/services';
import styles from './Info.less';

type Props = {
    streamingServer: StreamingServer,
};

const Info = ({ streamingServer }: Props) => {
    const { shell } = useServices();

    const settings = useMemo(() => (
        streamingServer?.settings?.type === 'Ready' ?
            streamingServer.settings.content as StreamingServerSettings : null
    ), [streamingServer?.settings]);

    return (
        <Section className={styles['info']}>
            <Option label={'App Vesion'}>
                <div className={styles['label']}>
                    {process.env.VERSION}
                </div>
            </Option>
            <Option label={'Build Version'}>
                <div className={styles['label']}>
                    {process.env.COMMIT_HASH}
                </div>
            </Option>
            {
                settings?.serverVersion &&
                    <Option label={'Server Version'}>
                        <div className={styles['label']}>
                            {settings.serverVersion}
                        </div>
                    </Option>
            }
            {
                typeof shell?.transport?.props?.shellVersion === 'string' &&
                    <Option label={'Shell Version'}>
                        <div className={styles['label']}>
                            {shell.transport.props.shellVersion}
                        </div>
                    </Option>
            }
        </Section>
    );
};

export default Info;
