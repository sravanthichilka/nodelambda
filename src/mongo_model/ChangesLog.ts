import { Schema, model } from 'mongoose';
import config from "../config/app";

const ChangesLogSchema = new Schema({
    label: {
        type: String
    },
    previous_value_updated_user_id: {
        type: Number
    },
    previous_value_updated_by: {
        type: String
    },
    previous_value_updated_on:{
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
            previous_sub_heading:{
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
ChangesLogSchema.index( { "createdAt": 1 }, { expireAfterSeconds: config.MONGO_DB.DB_MONGO_TLS_IN_SECOND } );
export default model('ChangesLog', ChangesLogSchema);