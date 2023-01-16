import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getCallRecords } from "../Common/CallRecords";
import { getToken } from "../Common/Token";
import { uploadBlob } from "../Common/DataUpload";
import { buildData } from "../Common/BuildData";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let token = await getToken();
    let date = new Date();
    let startDate = new Date();
    startDate.setDate(date.getDate() - 5);
    let callRecords = await getCallRecords(token, startDate, date);
    let data = await buildData(context, token, callRecords);
    let response = await uploadBlob(context, date, data);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: response
    };
};

export default httpTrigger;