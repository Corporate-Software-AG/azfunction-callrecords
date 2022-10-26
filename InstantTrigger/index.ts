import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getCallRecords } from "../Common/CallRecords";
import { getToken } from "../Common/Token";
import { uploadBlobs } from "../Common/DataUpload";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let token = await getToken();
    let date = new Date();
    let startDate = new Date();
    startDate.setDate(date.getDate() - 1);
    let callRecords = await getCallRecords(token, startDate, date);
    await uploadBlobs(context, token, date, callRecords)

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { callRecords: callRecords }
    };
};

export default httpTrigger;