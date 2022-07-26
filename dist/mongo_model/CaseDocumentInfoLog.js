"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CaseDocumentInfoLogSchema = new mongoose_1.Schema({
    userId: {
        type: Number
    },
    // eventType: {
    //     type: Number
    // },
    // valueType:{
    //     type: Number,
    //     enum: [ 
    //         EVENTLOG_DATA_LOGS.ORIGINAL_VALUE,
    //         EVENTLOG_DATA_LOGS.CHANGED_VALUE,             
    //       ] 
    // },
    documentId: {
        type: Number
    },
    companyId: {
        type: Number
    },
    label: {
        type: String
    },
    previous_value_updated_user_id: {
        type: Number
    },
    previous_value_updated_by: {
        type: String
    },
    previous_value_updated_on: {
        type: Date
    },
    current_value_updated_user_id: {
        type: Number
    },
    current_value_updated_by: {
        type: String
    },
    current_value_updated_on: {
        type: Date
    },
    event_changes: [
        {
            label: {
                type: String
            },
            previous_value: {
                type: String
            },
            current_value: {
                type: String
            },
        }
    ]
}, {
    timestamps: true
});
exports.default = mongoose_1.model('CaseDocumentInfoLog', CaseDocumentInfoLogSchema);
