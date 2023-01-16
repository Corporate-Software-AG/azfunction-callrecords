import { getDetailedCallRecord } from "./CallRecords";

const CONNECTION_STRING = process.env.AzureWebJobsStorage;
if (!CONNECTION_STRING) throw Error('Azure Storage Connection string not found');

export async function buildData(context, token, callRecords) {
    let objs = [];
    for (let record of callRecords.value) {
        let detailedRecord = await getDetailedCallRecord(token, record);
        let recordObj = { id: null, duration: null, inviteDateTime: null, correlationId: null, userPrincipalName: null, callType: null, participants: [] }
        try { recordObj.id = record.id; } catch (e) { recordObj.id = null }
        try { recordObj.inviteDateTime = record.inviteDateTime; } catch (e) { recordObj.inviteDateTime = null }
        try { recordObj.duration = record.duration; } catch (e) { recordObj.duration = null }
        try { recordObj.callType = record.callType; } catch (e) { recordObj.callType = null }
        try { recordObj.correlationId = record.correlationId; } catch (e) { recordObj.correlationId = null }
        try { recordObj.userPrincipalName = record.userPrincipalName; } catch (e) { recordObj.userPrincipalName = null }

        for (let participant of detailedRecord.participants) {
            let participantObj = { displayName: null, phone: null };
            try { participantObj.displayName = participant.user.displayName; } catch (e) { participantObj.displayName = null }
            try { participantObj.phone = participant.phone.id; } catch (e) { participantObj.phone = null }
            context.log("Participant: ", participantObj);
            recordObj.participants.push(participantObj);
        }
        objs.push(recordObj)
    }
    context.log("Export Data: ", objs)
    return JSON.stringify(objs);;
}
