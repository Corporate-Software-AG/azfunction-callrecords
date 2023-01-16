import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { buildData } from "../Common/BuildData";
import { getCallRecords } from "../Common/CallRecords";
import { uploadBlob } from "../Common/DataUpload";
import { getToken } from "../Common/Token";

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    let token = await getToken();
    let date = new Date();
    let startDate = new Date();
    startDate.setDate(date.getDate() - 1);
    let callRecords = await getCallRecords(token, startDate, date);
    let data = await buildData(context, token, callRecords);
    await uploadBlob(context, date, data);
};
export default timerTrigger;
