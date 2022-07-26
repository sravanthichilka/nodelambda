"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Knex = void 0;
const logs_1 = __importDefault(require("../helper/logs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
var Knex;
(function (Knex) {
    Knex.config = {
        client: process.env.DB_CLIENT,
        // debug: true,
        connection: {
            host: process.env.DB_HOSTNAME,
            database: process.env.DB_NAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            typeCast: function (field, next) {
                return next();
            },
        },
        pool: {
            min: parseInt(process.env.DB_POOL_MIN),
            max: parseInt(process.env.DB_POOL_MAX),
        },
        migrations: {
            tableName: "KnexMigrations",
        },
    };
    logs_1.default.info(["connect to mysql: ", Knex.config]);
})(Knex = exports.Knex || (exports.Knex = {}));
exports.default = { Knex };
