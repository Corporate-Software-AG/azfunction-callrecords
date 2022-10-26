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
