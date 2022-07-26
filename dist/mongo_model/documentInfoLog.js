"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../helper/constants");
const DocumentInfoLogSchema = new mongoose_1.Schema({
    userId: {
        type: Number
    },
    eventType: {
        type: Number
    },
    valueType: {
        type: Number,
        enum: [
            constants_1.EVENTLOG_DATA_LOGS.ORIGINAL_VALUE,
            constants_1.EVENTLOG_DATA_LOGS.CHANGED_VALUE,
        ]
    },
    documentId: {
        type: Number
    },
    companyId: {
        type: Number
    },
    created_by: {
        type: Number
    },
    created_by_string: {
        type: String
    },
    modified_by: {
        type: Number
    },
    modified_by_string: {
        type: String
    },
    record_created_at: {
        type: Date
    },
    record_modified_at: {
        type: Date
    },
    fileName: {
        type: String
    },
    fileType: {
        type: String
    },
}, {
    timestamps: true
});
exports.default = mongoose_1.model('DocumentInfoLog', DocumentInfoLogSchema);
