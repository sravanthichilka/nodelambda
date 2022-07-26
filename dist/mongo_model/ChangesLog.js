"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("../config/app"));
const ChangesLogSchema = new mongoose_1.Schema({
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
            previous_sub_heading: {
                type: String
            },
            current_value: {
                type: String
            },
            current_sub_heading: {
                type: String
            }
        }
    ]
}, {
    timestamps: true
});
ChangesLogSchema.index({ "createdAt": 1 }, { expireAfterSeconds: app_1.default.MONGO_DB.DB_MONGO_TLS_IN_SECOND });
exports.default = mongoose_1.model('ChangesLog', ChangesLogSchema);
