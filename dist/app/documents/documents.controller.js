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
const customers_repo_1 = __importDefault(require("../customers/customers.repo"));
const documents_repo_1 = __importDefault(require("./documents.repo"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const logs_1 = __importDefault(require("../../helper/logs"));
const constants_1 = require("../../helper/constants");
const message_1 = __importDefault(require("../../helper/message"));
class UserController extends auth_helper_1.default {
    getDocuments(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { filter, sortBy, currentPage, recordPerPage }, params: {}, } = req;
                let { query: { companyId }, } = req;
                let onSiteSystemData;
                const sqlQuery = [];
                const sqlQueryParams = [];
                if (companyId) {
                    const companyData = yield _super.validateCompanyId.call(this, companyId);
                    onSiteSystemData = companyData.onSiteSystemData;
                    //  customer login and view document api.
                    // const isAuthorizeByRole: boolean = super.isCurrentRoleAuthorize(consumeUserRole, companyData.userRole);
                    // if (!isAuthorizeByRole) {
                    //     return res.status(statusCodes.FORBIDDEN).send({ status_code: statusCodes.FORBIDDEN, message: "You are not authorized to update anything on this user." });
                    // }
                }
                if (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER) {
                    const customerUserData = yield customers_repo_1.default.getCompanyUserDataFromUserId(consumeUserId);
                    companyId = customerUserData.companyId;
                    sqlQuery.push(` c.id = ?`);
                    sqlQueryParams.push(companyId);
                }
                else if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    if (companyId) {
                        yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                        sqlQuery.push(` c.id = ?`);
                        sqlQueryParams.push(companyId);
                    }
                    else {
                        const teamMemberData = yield customers_repo_1.default.getCompanyListFromTeammember(consumeUserId);
                        const tmIds = [];
                        const tmComma = [];
                        if (teamMemberData && teamMemberData.length) {
                            teamMemberData.map((rec) => {
                                tmComma.push("?");
                                tmIds.push(rec.companyId);
                            });
                        }
                        else {
                            tmComma.push("?");
                            tmIds.push(-1);
                        }
                        if (tmIds && tmIds.length) {
                            sqlQuery.push(` c.id IN (${tmComma.join()})`);
                            sqlQueryParams.push(...tmIds);
                        }
                    }
                }
                else {
                    if (companyId) {
                        sqlQuery.push(` c.id = ?`);
                        sqlQueryParams.push(companyId);
                    }
                }
                const sortObject = { column: "d.id", order: "desc" };
                const pageLimitObj = {
                    limit: recordPerPage,
                    offset: recordPerPage * currentPage - recordPerPage,
                };
                if (filter) {
                    if (filter.companyName) {
                        sqlQuery.push(`c.companyName like ? `);
                        sqlQueryParams.push(`%${filter.companyName}%`);
                    }
                    if (filter.documentName) {
                        sqlQuery.push(`d.documentName like ? `);
                        sqlQueryParams.push(`%${filter.documentName}%`);
                    }
                    if (filter.documentType) {
                        sqlQuery.push(` d.documentType = ?`);
                        sqlQueryParams.push(filter.documentType);
                    }
                }
                if (sortBy) {
                    for (let sortByKey in sortBy) {
                        if (["documentName", "documentTypeName"].includes(sortByKey)) {
                            sortObject.column = sortByKey;
                            if (sortByKey === "documentTypeName") {
                                sortObject.column = "dt.documentTypeName";
                            }
                            sortObject.order = sortBy[sortByKey];
                        }
                    }
                }
                let sqlQueryBuilder = sqlQuery.join(" and ");
                let sqlQueryBuilderList = sqlQueryParams;
                let userListCountPromise = documents_repo_1.default.getDocumentListCount(sqlQueryBuilder, sqlQueryBuilderList, { sortObject });
                let userListPromise = documents_repo_1.default.getDocumentList(sqlQueryBuilder, sqlQueryBuilderList, {
                    sortObject,
                    pageLimit: pageLimitObj,
                });
                Promise.all([userListCountPromise, userListPromise])
                    .then((values) => {
                    let [userListCount, userList] = values;
                    const totalPages = Math.ceil(userListCount / recordPerPage);
                    const data = {
                        records: userList,
                        recordsMetaData: {
                            recordPerPage,
                            currentPage,
                            totalPages,
                            totalRecords: userListCount,
                        },
                        onSiteSystemData: onSiteSystemData,
                    };
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
                })
                    .catch((e) => {
                    logs_1.default.error(["getCustomers: catch::", e]);
                    return res.sendErrorResponse(http_status_codes_1.default.SERVICE_UNAVAILABLE, message_1.default.SOMETHING_WENT_WRONG, { errors: e.message });
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
}
exports.default = new UserController();
