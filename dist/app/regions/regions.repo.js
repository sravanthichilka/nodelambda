"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const connection = require("../../config/database").Knex.config;
const db = knex_1.default(connection);
const logs_1 = __importDefault(require("../../helper/logs"));
class UserRepo {
    getRegionFetchList(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("regions")
                .select("id", "regionName")
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .offset(data.pageLimit.offset)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getRegionFetchList", error.message]);
                resolve(null);
            });
        });
    }
}
exports.default = new UserRepo();
