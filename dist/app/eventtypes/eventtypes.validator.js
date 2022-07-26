"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require('@hapi/joi');
const authSchema = {
    fetchEventTypes: Joi.object({
        showCustomerEventLogList: Joi.boolean().default(false)
    }),
};
exports.default = authSchema;
