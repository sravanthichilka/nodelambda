"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("@hapi/joi");
const authSchema = {
    getDocuments: Joi.object({
        currentPage: Joi.number().default(1),
        recordPerPage: Joi.number().default(10),
        companyId: Joi.number(),
        sortBy: Joi.object({
            documentName: Joi.string().valid("asc", "desc"),
            documentTypeName: Joi.string().valid("asc", "desc"),
        }),
        filter: Joi.object({
            companyName: Joi.string(),
            documentName: Joi.string(),
            documentType: Joi.number(),
        }),
    }),
};
exports.default = authSchema;
