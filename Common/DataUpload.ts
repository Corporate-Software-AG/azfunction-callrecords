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
    context.log("SUMMARY: ", callRecords)
    let objs = [];

    for (let record of callRecords.value) {
        let detailedRecord = await getDetailedCallRecord(token, record);
        for (let participant of detailedRecord.participants) {
            let obj = { name: null, displayName: null, phone: null };
            obj.name = record.id;
            try { obj.displayName = participant.user.displayName; } catch (e) { obj.displayName = null }
            try { obj.phone = participant.phone.id; } catch (e) { obj.phone = null }
            context.log("OBJ: ", obj);
            objs.push(obj);
        }
    }
    context.log("New Summary: ", objs);
    let cleanSummary = JSON.stringify(objs);
    blobClient.upload(cleanSummary, cleanSummary.length);
    context.log("uploaded: ", blobName);
}
