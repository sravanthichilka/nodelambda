"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importDefault(require("./main"));
const app_1 = __importDefault(require("./config/app"));
const logs_1 = __importDefault(require("./helper/logs"));
const port = app_1.default.app.PORT;
main_1.default.listen(port, function () {
    logs_1.default.info([`Server is running on ${port}`]);
});
