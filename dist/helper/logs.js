"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
class Logs {
    /**
     * Log info..
     * @param winstonMSG
     */
    info(winstonMSG) {
        if (typeof winstonMSG == 'object') {
            winstonMSG = JSON.stringify(winstonMSG);
        }
        logger_1.default.info(winstonMSG);
    }
    /**
     * Log errors..
     * @param winstonMSG
     */
    error(winstonMSG) {
        if (typeof winstonMSG == 'object') {
            winstonMSG = JSON.stringify(winstonMSG);
        }
        logger_1.default.error(winstonMSG);
    }
}
exports.default = new Logs();
