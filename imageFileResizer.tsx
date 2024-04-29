import { resolve } from "path";
import Resizer from "react-image-file-resizer";

interface resizeFileTypes {
    file: Blob | File,
    maxWidth?: number,
    maxHeight?: number,
    compressFormat?: 'JPEG' | 'PNG' | 'WEBP',
    quality?: number,
    rotation?: number,
    outputType?: 'base64' | 'blob' | 'file'
    responseUriFunc?: (value: string | Blob | File | ProgressEvent<FileReader>) => void,
    minWidth?: number | null,
    minHeight?: number | null,
}
export default function resizeFile(
    {
        file,
        maxWidth = Number.MAX_SAFE_INTEGER,
        maxHeight = Number.MAX_SAFE_INTEGER,
        compressFormat = 'WEBP',
        quality = 100,
        rotation = 0,
        outputType = 'blob',
        responseUriFunc = undefined,
        minWidth = null,
        minHeight = null
    }: resizeFileTypes
) {
    // Check if file is not a blob -> Convert to blob
    if (!(file instanceof Blob)) {
        file = new Blob([file], { type: (file as File).type });
    }

    return new Promise<string | Blob | File | ProgressEvent<FileReader>>((resolve) => {
        Resizer.imageFileResizer(
            file as Blob,
            maxWidth,
            maxHeight,
            compressFormat,
            quality,
            rotation,
            responseUriFunc ? responseUriFunc : (value: string | Blob | File | ProgressEvent<FileReader>) => {
                resolve(value);
            },
            outputType,
            minWidth ?? maxWidth,
            minHeight ?? maxHeight
        );
    })
}