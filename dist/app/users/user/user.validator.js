"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require('@hapi/joi');
const authSchema = {
    getMe: Joi.object({}),
    viewProfile: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phoneNumber: Joi.string().pattern(/^[0-9]+$/),
    }),
    setPassword: Joi.object({
        password: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    }),
    myEventList: Joi.object({
        filter: Joi.object({
            eventTypeId: Joi.number()
        }),
        currentPage: Joi.number().default(1),
        recordPerPage: Joi.number().default(10)
    }),
};
exports.default = authSchema;
