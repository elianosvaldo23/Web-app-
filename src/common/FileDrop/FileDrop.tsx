import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type FileType = string;
export type FileDropListener = (file: File) => void;

type FileDropContext = {
    on: (type: FileType, listener: FileDropListener) => void,
    off: (type: FileType, listener: FileDropListener) => void,
};

const FileDropContext = createContext({} as FileDropContext);

type Props = {
    children: JSX.Element,
};

const FileDropProvider = ({ children }: Props) => {
    const [listeners, setListeners] = useState<[FileType, FileDropListener][]>([]);

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
    };

    const onDrop = useCallback((event: DragEvent) => {
        event.preventDefault();

        const { dataTransfer } = event;

        if (dataTransfer && dataTransfer.files.length > 0) {
            const file = dataTransfer.files[0];

            listeners
                .filter(([type]) => type === file.type)
                .forEach(([, listerner]) => listerner(file));
        }
    }, [listeners]);

    const on = (type: FileType, listener: FileDropListener) => {
        setListeners((listeners) => {
            return [...listeners, [type, listener]];
        });
    };

    const off = (type: FileType, listener: FileDropListener) => {
        setListeners((listeners) => {
            return listeners.filter(([key, value]) => key !== type && value !== listener);
        });
    };

    useEffect(() => {
        window.addEventListener('dragover', onDragOver);
        window.addEventListener('drop', onDrop);

        return () => {
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('drop', onDrop);
        };
    }, [onDrop]);

    return (
        <FileDropContext.Provider value={{ on, off }}>
            { children }
        </FileDropContext.Provider>
    );
};

const useFileDrop = () => {
    return useContext(FileDropContext);
};

export {
    FileDropProvider,
    useFileDrop,
};
