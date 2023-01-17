import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobServiceClient } from "@azure/storage-blob";
import { buildDataFromFiles } from "../Common/BuildData";
import { getDataFromFile } from "../Common/CallRecords";
import { uploadBlobFromFiles } from "../Common/DataUpload";

const CONNECTION_STRING = process.env.AzureWebJobsStorage;
if (!CONNECTION_STRING) throw Error('Azure Storage Connection string not found');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const containerName = "call-records";
    let containerClient = blobServiceClient.getContainerClient(containerName);

    let message = await iterateFolders(context, containerClient, "")

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: message
    };
};

async function iterateFolders(context, containerClient, prefixStr) {

    try {
        // page size - artificially low as example
        const maxPageSize = 9999;

        // some options for filtering list
        const listOptions = {
            includeMetadata: false,
            includeSnapshots: false,
            includeTags: false,
            includeVersions: false,
            prefix: prefixStr
        };

        let delimiter = '/';
        console.log(`Folder ${delimiter}${prefixStr}`);

        for await (const response of containerClient
            .listBlobsByHierarchy(delimiter, listOptions)
            .byPage({ maxPageSize })) {

            const segment = response.segment;

            if (segment.blobPrefixes) {

                // Do something with each virtual folder
                for await (const prefix of segment.blobPrefixes) {
                    let summary = await getDataFromFile(containerClient, prefix.name, "summary.json")
                    context.log(prefix.name);
                    let dateSplit = prefix.name.split("/")[0].split("-");
                    let dateMonth = parseInt(dateSplit[1]) < 10 ? "0" + dateSplit[1] : dateSplit[1];
                    let dateDay = parseInt(dateSplit[2]) < 10 ? "0" + dateSplit[2] : dateSplit[2];
                    let blobName = `${dateSplit[0]}-${dateMonth}-${dateDay}.json`;
                    let data = await buildDataFromFiles(context, containerClient, prefix.name, summary);
                    await uploadBlobFromFiles(context, blobName, data);
                }
            }
        }
        return "success"
    } catch (e) {
        return e.message;
    }
}

export default httpTrigger;