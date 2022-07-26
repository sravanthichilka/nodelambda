const debug = require("debug")("app:customEvents:article");
const EventEmitter = require("events");
import { ENUM_EVENT_TYPE_LOGS } from "../helper/constants";
import logsModal from "../mongo_model/logsModal";
import ChangesLogSchema from "../mongo_model/ChangesLog";
import log from "../helper/logs";
import { addLogEventInterface, anyLogEventInterface } from "./customEventInterface";

class EventLogsCustomEmitter extends EventEmitter {}
const EventLogCustomEmitter = new EventLogsCustomEmitter();

EventLogCustomEmitter.on(
  "add-event",
  async function (
    eventLogsObj: addLogEventInterface &
      Partial<{ companyId: number; companyName: string; documentId: number; documentName: string }>
  ) {
    let case2documentInfoLogs: any = [];

    if (eventLogsObj.changes && Array.isArray(eventLogsObj.changes)) {
      const ChangesLogObjArray = [];
      for (let rec of eventLogsObj.changes) {
        ChangesLogObjArray.push({
          ...rec.meta,
          event_changes: rec.event_changes,
        });
      }

      const addedIds = await ChangesLogSchema.insertMany(ChangesLogObjArray);
      case2documentInfoLogs = addedIds.map((rec) => rec._id);
    } else {
      if (eventLogsObj.changes) {
        const saveData = {
          ...eventLogsObj.changes.meta,
          event_changes: eventLogsObj.changes.event_changes,
        };

        const addedIds = await ChangesLogSchema.insertMany([saveData]);
        case2documentInfoLogs = addedIds.map((rec) => rec._id);
      }
    }

    const createObj: addLogEventInterface &
      Partial<{
        companyId: number;
        companyName: string;
        documentId: number;
        documentName: string;
      }> = {
      alterRecordUserId: eventLogsObj.alterRecordUserId,
      userId: eventLogsObj.userId,
      alterRecordUserRoleId: eventLogsObj.alterRecordUserRoleId,
      userRoleId: eventLogsObj.userRoleId,
      userName: eventLogsObj.userName,
      eventTypeId: eventLogsObj.eventTypeId,
      eventTypeLabel: eventLogsObj.eventTypeLabel,
      eventMessage: eventLogsObj.eventMessage,
      userAgent: eventLogsObj.userAgent,
    };

    if (eventLogsObj.companyId) {
      createObj.companyId = eventLogsObj.companyId;
    }
    if (eventLogsObj.documentId) {
      createObj.documentId = eventLogsObj.documentId;
    }
    if (eventLogsObj.companyName) {
      createObj.companyName = eventLogsObj.companyName;
    }
    if (eventLogsObj.documentName) {
      createObj.documentName = eventLogsObj.documentName;
    }

    createObj.changes = case2documentInfoLogs;

    logsModal.create(createObj, (err: any, data: any) => {
      if (err) {
        // throw err;
        log.info(["logsModal:", err.message]);
      }
    });
  }
);

export default EventLogCustomEmitter;
