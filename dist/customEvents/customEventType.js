"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug")("app:customEvents:article");
const EventEmitter = require("events");
const logsModal_1 = __importDefault(require("../mongo_model/logsModal"));
const ChangesLog_1 = __importDefault(require("../mongo_model/ChangesLog"));
const logs_1 = __importDefault(require("../helper/logs"));
class EventLogsCustomEmitter extends EventEmitter {
}
const EventLogCustomEmitter = new EventLogsCustomEmitter();
EventLogCustomEmitter.on("add-event", function (eventLogsObj) {
    return __awaiter(this, void 0, void 0, function* () {
        let case2documentInfoLogs = [];
        if (eventLogsObj.changes && Array.isArray(eventLogsObj.changes)) {
            const ChangesLogObjArray = [];
            for (let rec of eventLogsObj.changes) {
                ChangesLogObjArray.push(Object.assign(Object.assign({}, rec.meta), { event_changes: rec.event_changes }));
            }
            const addedIds = yield ChangesLog_1.default.insertMany(ChangesLogObjArray);
            case2documentInfoLogs = addedIds.map((rec) => rec._id);
        }
        else {
            if (eventLogsObj.changes) {
                const saveData = Object.assign(Object.assign({}, eventLogsObj.changes.meta), { event_changes: eventLogsObj.changes.event_changes });
                const addedIds = yield ChangesLog_1.default.insertMany([saveData]);
                case2documentInfoLogs = addedIds.map((rec) => rec._id);
            }
        }
        const createObj = {
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
        logsModal_1.default.create(createObj, (err, data) => {
            if (err) {
                // throw err;
                logs_1.default.info(["logsModal:", err.message]);
            }
        });
    });
});
exports.default = EventLogCustomEmitter;
