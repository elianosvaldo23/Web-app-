import { useEffect } from 'react';

const onFileDrop = (types: string[], callback: (file: File) => void) => {
    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
    };

    const onDrop = (event: DragEvent) => {
        event.preventDefault();

        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];

            if (types.includes(file.type)) {
                callback(file);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('dragover', onDragOver);
        window.addEventListener('drop', onDrop);

        return () => {
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('drop', onDrop);
        };
    }, []);
};

export default onFileDrop;
