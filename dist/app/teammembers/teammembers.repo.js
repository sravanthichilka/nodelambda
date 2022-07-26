"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const constants_1 = require("../../helper/constants");
const connection = require('../../config/database').Knex.config;
const db = knex_1.default(connection);
const logs_1 = __importDefault(require("../../helper/logs"));
;
class TeamMemberRepo {
    // fetch all team member while assign customer 
    //not matter active or inactive
    fetchTeamMember(sql, sqlP, data) {
        return new Promise(function (resolve) {
            db('users')
                .select('id', 'email', 'firstName', 'lastName', 'status', 'role', "phoneNumber")
                .where({ role: constants_1.ENUM_User_ROLE.TEAM_MEMBER })
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(['fetchTeamMember', error.message]);
                resolve(null);
            });
        });
    }
}
exports.default = new TeamMemberRepo();
