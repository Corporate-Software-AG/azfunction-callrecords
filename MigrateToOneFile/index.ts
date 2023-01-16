import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobServiceClient } from "@azure/storage-blob";

const CONNECTION_STRING = process.env.AzureWebJobsStorage;
if (!CONNECTION_STRING) throw Error('Azure Storage Connection string not found');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const containerName = "call-records";
    let containerClient = blobServiceClient.getContainerClient(containerName);

    const maxPageSize = 99999;

    let i = 1;

    // some options for filtering list
    const listOptions = {
        includeMetadata: false,
        includeSnapshots: false,
        includeTags: false,
        includeVersions: false,
        prefix: ''
    };

    let iterator = containerClient.listBlobsFlat(listOptions).byPage({ maxPageSize });
    let response = (await iterator.next()).value;

    let message = "";
    // Prints blob names
    for (const blob of response.segment.blobItems) {
        context.log(`Flat listing: ${i}: ${blob.name}`);
        message += `Flat listing: ${i}: ${blob.name}\n`;
        i++;
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: message
    };
};

export default httpTrigger;