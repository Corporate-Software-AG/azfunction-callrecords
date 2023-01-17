import { BlobServiceClient } from "@azure/storage-blob";

const CONNECTION_STRING = process.env.AzureWebJobsStorage;
if (!CONNECTION_STRING) throw Error('Azure Storage Connection string not found');

export async function uploadBlob(context, date, data) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const containerName = "call-records";
    let containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `${date.getFullYear()}-${(((date.getMonth() + 1) < 10) ? "0" : "") + (date.getMonth() + 1)}-${((date.getDate() < 10) ? "0" : "") + date.getDate()}.json`
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.upload(data, data.length);
    context.log("uploaded: ", blobName);
}

export async function uploadBlobFromFiles(context, blobName, data) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const containerName = "call-records";
    let containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.upload(data, data.length);
    context.log("uploaded: ", blobName);
}