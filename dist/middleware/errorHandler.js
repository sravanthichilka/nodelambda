"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logs_1 = __importDefault(require("../helper/logs"));
const errorHandler = (error, request, response, next) => {
    if (error && error.error && error.error.isJoi) {
        return response.status(422).json({
            status_code: 422,
            isJoi: true,
            type: error.type,
            message: error.error.toString(),
            error
        });
    }
    else {
        const status = error.statusCode || error.status || 500;
        logs_1.default.error(error);
        return response.status(500).send({
            status_code: 500,
            message: error.message,
            error
        });
    }
};
exports.errorHandler = errorHandler;
