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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const teammembers_repo_1 = __importDefault(require("./teammembers.repo"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const logs_1 = __importDefault(require("../../helper/logs"));
const message_1 = __importDefault(require("../../helper/message"));
class TeamMemberController extends auth_helper_1.default {
    // fetch all team member while assign customer 
    fetchTeamMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id, role: consumeUserRole }, query: { filter } } = req;
                const sqlQuery = [];
                const sqlQueryParams = [];
                const sortObject = { column: "firstName", order: "asc" };
                const pageLimitObj = { limit: 100 };
                sqlQuery.push(` id != ? `);
                sqlQueryParams.push(id);
                if (filter) {
                    if (filter.firstLastAndEmail) {
                        sqlQuery.push(`( firstName like ? or lastName like ? or email like ? )`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                    }
                }
                let sqlQueryBuilder = sqlQuery.join(" and ");
                let sqlQueryBuilderList = sqlQueryParams;
                const fetchTeamMemberPromise = teammembers_repo_1.default.fetchTeamMember(sqlQueryBuilder, sqlQueryBuilderList, { sortObject, pageLimit: pageLimitObj });
                let userList = yield fetchTeamMemberPromise;
                const data = {
                    records: userList,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(['additionalInformation', Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
}
exports.default = new TeamMemberController();
