"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const path_1 = __importDefault(require("path"));
const compression_1 = __importDefault(require("compression"));
const mongoConnection = require("./config/mongo_database");
const logs_1 = __importDefault(require("./helper/logs"));
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoConnection.connectDB();
        logs_1.default.info([mongoConnection.connectDB]);
    });
})();
class App {
    constructor() {
        this.express = express_1.default();
        this.express.use(compression_1.default());
        this.express.use(express_1.default.static(path_1.default.join(__dirname, "public")));
        this.express.use("/static", express_1.default.static("public"));
        this.express.set("view engine", "ejs");
        this.defaults();
    }
    defaults() {
        this.express
            .use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,content-type,Authorization,Access-Token,Refresh-Token");
            res.setHeader("Access-Control-Expose-Headers", "Origin,X-Requested-With,content-type,Authorization,Access-Token,Refresh-Token");
            req.userAgent = req.get("User-Agent");
            res.sendSucessResponse = (statusCode, message, data = undefined) => {
                let _data;
                if (data) {
                    _data = Object.assign({}, data);
                }
                return res
                    .status(statusCode)
                    .send({ status_code: statusCode, message: message, data: _data });
            };
            res.sendErrorResponse = (statusCode, message, error) => {
                return res
                    .status(statusCode)
                    .send(Object.assign({ status_code: statusCode, message: message }, error));
            };
            next();
        })
            .use(express_1.default.urlencoded({ extended: false }))
            .use(express_1.default.json({ type: "*/*" }))
            .use(express_1.default.raw())
            .use(routes_1.default)
            .use(notFoundHandler_1.notFoundHandler)
            .use(errorHandler_1.errorHandler);
    }
}
exports.default = new App().express;
