import axios from 'axios'
import fileDownload from 'js-file-download'

interface downloadFileTypes {
    url: string,
    fileName: string,
    fileType?: string | null,
}
export default function downloadFile(
    {
        url,
        fileName,
        fileType = null
    }: downloadFileTypes
) {
    axios({
        url: url,
        method: 'GET',
        responseType: 'blob',
    }).then((response) => {
        fileDownload(response.data, fileName, fileType ?? undefined)
    });
}