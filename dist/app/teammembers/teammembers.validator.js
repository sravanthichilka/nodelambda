"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("@hapi/joi");
const authSchema = {
    teamMemberList: Joi.object({
        filter: Joi.object({
            firstLastAndEmail: Joi.string(),
        }),
    }),
};
exports.default = authSchema;
