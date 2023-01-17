import axios, { AxiosRequestConfig } from 'axios';

const MS_GRAPH_ENDPOINT_CALLRECORDS = 'https://graph.microsoft.com/v1.0/communications/callRecords/getDirectRoutingCalls(fromDateTime={startdate},toDateTime={enddate})';
const MS_GRAPH_ENDPOINT_CALLRECORD = 'https://graph.microsoft.com/v1.0/communications/callRecords/';

/**
 * Get callRecords
 * @param token Token to authenticate through MS Graph
 */
export async function getCallRecords(token: string, startDate: Date, date: Date): Promise<any> {
    let config: AxiosRequestConfig = {
        method: 'get',
        url: MS_GRAPH_ENDPOINT_CALLRECORDS.replace("{startdate}", `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`).replace("{enddate}", `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`),
        headers: {
            'Authorization': 'Bearer ' + token //the token is a variable which holds the token
        }
    }

    return await axios(config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            return error;
        });
}


/**
 * Get detailed callRecord info
 * @param token Token to authenticate through MS Graph
 */
export async function getDetailedCallRecord(token: string, record: any): Promise<any> {
    let config: AxiosRequestConfig = {
        method: 'get',
        url: MS_GRAPH_ENDPOINT_CALLRECORD + record.correlationId,
        headers: {
            'Authorization': 'Bearer ' + token //the token is a variable which holds the token
        }
    }

    return await axios(config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            return error;
        });
}

export async function getDataFromFile(containerClient: any, prefix: string, fileName: string): Promise<any> {
    console.log(`DOWNLOAD: ${prefix}${fileName}`);
    let blobClient = await containerClient.getBlobClient(`${prefix}${fileName}`)
    let downloadResponse = await blobClient.download();
    const downloaded = (
        await streamToBuffer(downloadResponse.readableStreamBody)
    ).toString();

    const deleteoptions = {
        deleteSnapshots: 'include' // or 'only'
    }
    await blobClient.delete(deleteoptions);
    console.log(`Deleted blob ${prefix}${fileName}`);

    return JSON.parse(downloaded)
}

async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}
