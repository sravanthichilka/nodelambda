"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("../config/app"));
const LogEventsSchema = new mongoose_1.Schema({
    userId: {
        type: Number
    },
    userRoleId: {
        type: Number
    },
    alterRecordUserId: {
        type: Number
    },
    alterRecordUserRoleId: {
        type: Number
    },
    documentId: {
        type: Number
    },
    companyId: {
        type: Number
    },
    companyName: {
        type: String
    },
    documentName: {
        type: String
    },
    userName: {
        type: String
    },
    eventMessage: {
        type: String
    },
    eventTypeId: {
        type: Number
    },
    eventTypeLabel: {
        type: String
    },
    userAgent: {
        type: String
    },
    changes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "ChangesLog"
        }],
}, {
    timestamps: true
});
LogEventsSchema.index({ eventTypeId: 1, alterRecordUserId: 1, documentId: 1, companyId: 1 });
LogEventsSchema.index({ "createdAt": 1 }, { expireAfterSeconds: app_1.default.MONGO_DB.DB_MONGO_TLS_IN_SECOND });
exports.default = mongoose_1.model('LogEvent', LogEventsSchema);
