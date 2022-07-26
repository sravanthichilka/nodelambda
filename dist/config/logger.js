"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
/**
 * Ref link : https://www.npmjs.com/package/winston-daily-rotate-file
 * Ref link 2 : https://medium.com/@akshaypawar911/how-to-use-winston-daily-rotate-file-logger-in-nodejs-1e1996d2d38
 * Ref link 3 : https://www.npmjs.com/package/s3-streamlogger
 *
 */
const logFormat = winston_1.default.format.combine(
// winston.format.splat(),
winston_1.default.format.timestamp(), winston_1.default.format.align(), winston_1.default.format.printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`));
const transport = new winston_daily_rotate_file_1.default({
    filename: "logs/birko-api-%DATE%",
    datePattern: "YYYY-MM-DD",
    extension: ".log",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "20d",
    utc: true,
});
transport.on("rotate", function (oldFilename, newFilename) { });
const logger = winston_1.default.createLogger({
    format: logFormat,
    transports: [transport],
});
exports.default = logger;
