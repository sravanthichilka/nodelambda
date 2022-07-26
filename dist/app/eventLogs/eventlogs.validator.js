"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require('@hapi/joi');
const authSchema = {
    eventList: Joi.object({
        filter: Joi.object({
            eventTypeId: Joi.number(),
            companyId: Joi.number(),
            documentId: Joi.number(),
            userId: Joi.number()
        }),
        currentPage: Joi.number().default(1),
        recordPerPage: Joi.number().default(10)
    }),
};
exports.default = authSchema;
