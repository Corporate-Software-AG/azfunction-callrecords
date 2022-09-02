import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
import qs = require('qs');

const APP_ID = process.env["APP_ID"];
const APP_SECRET = process.env["APP_SECRET"];
const TENANT_ID = process.env["TENANT_ID"];
const CONNECTION_STRING_LAKE = process.env["CONNECTION_STRING_LAKE"];

const {
    DataLakeServiceClient,
    StorageSharedKeyCredential
} = require("@azure/storage-file-datalake");

const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const MS_GRAPH_ENDPOINT_CALLRECORDS = 'https://graph.microsoft.com/v1.0/communications/callRecords/getDirectRoutingCalls(fromDateTime={startdate},toDateTime={enddate})';
const MS_GRAPH_ENDPOINT_CALLRECORD = 'https://graph.microsoft.com/v1.0/communications/callRecords/';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let token = await getToken();
    let date = new Date();
    let callRecords = await getCallRecords(token, date);

    const accountName = CONNECTION_STRING_LAKE.split(";")[1].split("=")[1];
    const accountKey = CONNECTION_STRING_LAKE.split(";")[2].split("=")[1];
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const datalakeServiceClient = new DataLakeServiceClient(`https://${accountName}.dfs.core.windows.net`, sharedKeyCredential);

    const fileSystemName = "call-records";
    const fileSystemClient = datalakeServiceClient.getFileSystemClient(fileSystemName);

    let dirName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const directoryClient = fileSystemClient.getDirectoryClient(dirName);
    let response = await directoryClient.create();
    context.log(response);

    let callRecordsString = JSON.stringify(callRecords);
    const fileClient = fileSystemClient.getFileClient(`${dirName}/summary.json`);
    await fileClient.create();
    await fileClient.append(callRecordsString, 0, callRecordsString.length);
    await fileClient.flush(callRecordsString.length);

    for (let record of callRecords.value) {
        let detailedRecord = await getDetailedCallRecord(token, record);
        context.log(`${dirName}/${record.correlationId}.json`)
        let detailedRecordString = JSON.stringify(detailedRecord);

        const fileClient = fileSystemClient.getFileClient(`${dirName}/${record.correlationId}.json`);
        await fileClient.create();
        await fileClient.append(detailedRecordString, 0, detailedRecordString.length);
        await fileClient.flush(detailedRecordString.length);
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { callRecords: callRecords }
    };
};

export default httpTrigger;

/**
 * Get Token for MS Graph
 */
async function getToken(): Promise<string> {
    const postData = {
        client_id: APP_ID,
        scope: MS_GRAPH_SCOPE,
        client_secret: APP_SECRET,
        grant_type: 'client_credentials'
    };

    return await axios
        .post(TOKEN_ENDPOINT, qs.stringify(postData))
        .then(response => {
            return response.data.access_token;
        })
        .catch(error => {
            console.log(error);
        });
}


/**
 * Get callRecords
 * @param token Token to authenticate through MS Graph
 */
async function getCallRecords(token: string, date: Date): Promise<any> {
    let startDate = new Date();
    startDate.setDate(date.getDate() - 1);

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
async function getDetailedCallRecord(token: string, record: any): Promise<any> {
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