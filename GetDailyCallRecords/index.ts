import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getCallRecords } from "../Common/CallRecords";
import { uploadBlobs } from "../Common/DataUpload";
import { getToken } from "../Common/Token";

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    let token = await getToken();
    let date = new Date();
    let startDate = new Date();
    startDate.setDate(date.getDate() - 1);
    let callRecords = await getCallRecords(token, startDate, date);
    await uploadBlobs(context, token, date, callRecords)
};
export default timerTrigger;
