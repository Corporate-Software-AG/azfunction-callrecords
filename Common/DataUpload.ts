import { BlobServiceClient } from "@azure/storage-blob";
import { getDetailedCallRecord } from "../Common/CallRecords";

const CONNECTION_STRING = process.env.AzureWebJobsStorage;
if (!CONNECTION_STRING) throw Error('Azure Storage Connection string not found');

export async function uploadBlobs(context, token, date, callRecords) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const containerName = "call-records";
    let containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}/summary.json`
    const blobClient = await containerClient.getBlockBlobClient(blobName);
    let callRecordsString = JSON.stringify(callRecords);
    blobClient.upload(callRecordsString, callRecordsString.length)
    context.log("uploaded: ", blobName);

    for (let record of callRecords.value) {
        let detailedRecord = await getDetailedCallRecord(token, record);
        let detailedRecordString = JSON.stringify(detailedRecord);
        const blobName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}/${record.correlationId}.json`
        const blobClient = await containerClient.getBlockBlobClient(blobName);
        blobClient.upload(detailedRecordString, detailedRecordString.length);
        context.log("uploaded: ", blobName);
    }
}
