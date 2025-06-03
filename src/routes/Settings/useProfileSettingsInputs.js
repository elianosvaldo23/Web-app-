// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const { useServices } = require('stremio/services');
const { CONSTANTS, usePlatform, interfaceLanguages, languageNames } = require('stremio/common');

const useProfileSettingsInputs = (profile) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const platform = usePlatform();
    // TODO combine those useMemo in one
    const interfaceLanguageSelect = React.useMemo(() => ({
        options: interfaceLanguages.map(({ name, codes }) => ({
            value: codes[0],
            label: name,
        })),
        value: interfaceLanguages.find(({ codes }) => codes[1] === profile.settings.interfaceLanguage)?.codes?.[0] || profile.settings.interfaceLanguage,
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        interfaceLanguage: value
                    }
                }
            });
        }
    }), [profile.settings]);

    const hideSpoilersToggle = React.useMemo(() => ({
        checked: profile.settings.hideSpoilers,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        hideSpoilers: !profile.settings.hideSpoilers
                    }
                }
            });
        }
    }), [profile.settings]);

    const quitOnCloseToggle = React.useMemo(() => ({
        checked: profile.settings.quitOnClose,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        quitOnClose: !profile.settings.quitOnClose
                    }
                }
            });
        }
    }), [profile.settings]);

    const subtitlesLanguageSelect = React.useMemo(() => ({
        options: [
            { value: null, label: t('NONE') },
            ...Object.keys(languageNames).map((code) => ({
                value: code,
                label: languageNames[code]
            }))
        ],
        value: profile.settings.subtitlesLanguage,
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        subtitlesLanguage: value
                    }
                }
            });
        }
    }), [profile.settings]);
    const subtitlesSizeSelect = React.useMemo(() => ({
        options: CONSTANTS.SUBTITLES_SIZES.map((size) => ({
            value: `${size}`,
            label: `${size}%`
        })),
        value: `${profile.settings.subtitlesSize}`,
        title: () => {
            return `${profile.settings.subtitlesSize}%`;
        },
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        subtitlesSize: parseInt(value, 10)
                    }
                }
            });
        }
    }), [profile.settings]);
    const subtitlesTextColorInput = React.useMemo(() => ({
        value: profile.settings.subtitlesTextColor,
        onChange: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        subtitlesTextColor: value
                    }
                }
            });
        }
    }), [profile.settings]);
    const subtitlesBackgroundColorInput = React.useMemo(() => ({
        value: profile.settings.subtitlesBackgroundColor,
        onChange: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        subtitlesBackgroundColor: value
                    }
                }
            });
        }
    }), [profile.settings]);
    const subtitlesOutlineColorInput = React.useMemo(() => ({
        value: profile.settings.subtitlesOutlineColor,
        onChange: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        subtitlesOutlineColor: value
                    }
                }
            });
        }
    }), [profile.settings]);
    const audioLanguageSelect = React.useMemo(() => ({
        options: Object.keys(languageNames).map((code) => ({
            value: code,
            label: languageNames[code]
        })),
        value: profile.settings.audioLanguage,
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        audioLanguage: value
                    }
                }
            });
        }
    }), [profile.settings]);
    const surroundSoundToggle = React.useMemo(() => ({
        checked: profile.settings.surroundSound,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        surroundSound: !profile.settings.surroundSound
                    }
                }
            });
        }
    }), [profile.settings]);
    const escExitFullscreenToggle = React.useMemo(() => ({
        checked: profile.settings.escExitFullscreen,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        escExitFullscreen: !profile.settings.escExitFullscreen
                    }
                }
            });
        }
    }), [profile.settings]);

    const seekTimeDurationSelect = React.useMemo(() => ({
        options: CONSTANTS.SEEK_TIME_DURATIONS.map((size) => ({
            value: `${size}`,
            label: `${size / 1000} ${t('SECONDS')}`
        })),
        value: `${profile.settings.seekTimeDuration}`,
        title: () => {
            return `${profile.settings.seekTimeDuration / 1000} ${t('SECONDS')}`;
        },
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        seekTimeDuration: parseInt(value, 10)
                    }
                }
            });
        }
    }), [profile.settings]);
    const seekShortTimeDurationSelect = React.useMemo(() => ({
        options: CONSTANTS.SEEK_TIME_DURATIONS.map((size) => ({
            value: `${size}`,
            label: `${size / 1000} ${t('SECONDS')}`
        })),
        value: `${profile.settings.seekShortTimeDuration}`,
        title: () => {
            return `${profile.settings.seekShortTimeDuration / 1000} ${t('SECONDS')}`;
        },
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        seekShortTimeDuration: parseInt(value, 10)
                    }
                }
            });
        }
    }), [profile.settings]);
    const playInExternalPlayerSelect = React.useMemo(() => ({
        options: CONSTANTS.EXTERNAL_PLAYERS
            .filter(({ platforms }) => platforms.includes(platform.name))
            .map(({ label, value }) => ({
                value,
                label: t(label),
            })),
        value: profile.settings.playerType,
        title: () => {
            const selectedOption = CONSTANTS.EXTERNAL_PLAYERS.find(({ value }) => value === profile.settings.playerType);
            return selectedOption ? t(selectedOption.label, { defaultValue: selectedOption.label }) : profile.settings.playerType;
        },
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        playerType: value
                    }
                }
            });
        }
    }), [profile.settings]);
    const nextVideoPopupDurationSelect = React.useMemo(() => ({
        options: CONSTANTS.NEXT_VIDEO_POPUP_DURATIONS.map((duration) => ({
            value: `${duration}`,
            label: duration === 0 ? 'Disabled' : `${duration / 1000} ${t('SECONDS')}`
        })),
        value: `${profile.settings.nextVideoNotificationDuration}`,
        title: () => {
            return profile.settings.nextVideoNotificationDuration === 0 ?
                'Disabled'
                :
                `${profile.settings.nextVideoNotificationDuration / 1000} ${t('SECONDS')}`;
        },
        onSelect: (value) => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        nextVideoNotificationDuration: parseInt(value, 10)
                    }
                }
            });
        }
    }), [profile.settings]);
    const bingeWatchingToggle = React.useMemo(() => ({
        checked: profile.settings.bingeWatching,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        bingeWatching: !profile.settings.bingeWatching
                    }
                }
            });
        }
    }), [profile.settings]);
    const playInBackgroundToggle = React.useMemo(() => ({
        checked: profile.settings.playInBackground,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        playInBackground: !profile.settings.playInBackground
                    }
                }
            });
        }
    }), [profile.settings]);
    const hardwareDecodingToggle = React.useMemo(() => ({
        checked: profile.settings.hardwareDecoding,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        hardwareDecoding: !profile.settings.hardwareDecoding
                    }
                }
            });
        }
    }), [profile.settings]);
    const pauseOnMinimizeToggle = React.useMemo(() => ({
        checked: profile.settings.pauseOnMinimize,
        onClick: () => {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UpdateSettings',
                    args: {
                        ...profile.settings,
                        pauseOnMinimize: !profile.settings.pauseOnMinimize,
                    }
                }
            });
        }
    }), [profile.settings]);
    return {
        interfaceLanguageSelect,
        hideSpoilersToggle,
        subtitlesLanguageSelect,
        subtitlesSizeSelect,
        subtitlesTextColorInput,
        subtitlesBackgroundColorInput,
        subtitlesOutlineColorInput,
        audioLanguageSelect,
        surroundSoundToggle,
        escExitFullscreenToggle,
        quitOnCloseToggle,
        seekTimeDurationSelect,
        seekShortTimeDurationSelect,
        playInExternalPlayerSelect,
        nextVideoPopupDurationSelect,
        bingeWatchingToggle,
        playInBackgroundToggle,
        hardwareDecodingToggle,
        pauseOnMinimizeToggle,
    };
};

module.exports = useProfileSettingsInputs;
