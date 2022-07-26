import { Schema, model } from 'mongoose';
import { addLogEventInterface, companyAddLogEventInterface, documentAddLogEventInterface } from '../customEvents/customEventInterface';
import config from "../config/app";

const LogEventsSchema = new Schema<addLogEventInterface | companyAddLogEventInterface | documentAddLogEventInterface >({
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
    changes:[{
        type: Schema.Types.ObjectId,
        ref: "ChangesLog"
    }],

}, {
    timestamps: true
});
LogEventsSchema.index({ eventTypeId: 1, alterRecordUserId:1, documentId:1,  companyId: 1 });
LogEventsSchema.index( { "createdAt": 1 }, { expireAfterSeconds: config.MONGO_DB.DB_MONGO_TLS_IN_SECOND } );
export default model('LogEvent', LogEventsSchema);