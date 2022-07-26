"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("@hapi/joi");
const authSchema = {
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required(),
    }),
    resetPassword: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    }),
    refreshToken: Joi.object({
        refreshToken: Joi.string().required(),
    }),
    logout: Joi.object({
        refreshToken: Joi.string().required(),
    }),
};
exports.default = authSchema;
