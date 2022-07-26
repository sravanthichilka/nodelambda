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
const eventlogs_repo_1 = __importDefault(require("./eventlogs.repo"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const logs_1 = __importDefault(require("../../helper/logs"));
const message_1 = __importDefault(require("../../helper/message"));
const unProcessableError_1 = __importDefault(require("../../helper/error/unProcessableError"));
const constants_1 = require("../../helper/constants");
const customers_repo_1 = __importDefault(require("../customers/customers.repo"));
const users_repo_1 = __importDefault(require("../users/users.repo"));
class CustomerController extends auth_helper_1.default {
    fetchEventTypes(req, res) {
        const _super = Object.create(null, {
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { filter, sortBy, currentPage, recordPerPage }, } = req;
                const sortObject = { createdAt: -1 };
                let conditionObject = {};
                if (consumeUserRole === constants_1.ENUM_User_ROLE.SUPERADMIN) {
                    conditionObject["userRoleId"] = {
                        $in: [
                            constants_1.ENUM_User_ROLE.SUPERADMIN,
                            constants_1.ENUM_User_ROLE.ADMIN,
                            constants_1.ENUM_User_ROLE.TEAM_MEMBER,
                            constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                        ],
                    };
                    conditionObject["alterRecordUserRoleId"] = {
                        $in: [
                            constants_1.ENUM_User_ROLE.SUPERADMIN,
                            constants_1.ENUM_User_ROLE.ADMIN,
                            constants_1.ENUM_User_ROLE.TEAM_MEMBER,
                            constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                        ],
                    };
                }
                else if (consumeUserRole === constants_1.ENUM_User_ROLE.ADMIN) {
                    conditionObject["$or"] = [
                        {
                            alterRecordUserRoleId: {
                                $in: [constants_1.ENUM_User_ROLE.TEAM_MEMBER, constants_1.ENUM_User_ROLE.CUSTOMER_USER],
                            },
                        },
                        { userRoleId: { $in: [constants_1.ENUM_User_ROLE.TEAM_MEMBER, constants_1.ENUM_User_ROLE.CUSTOMER_USER] } },
                        { userId: consumeUserId },
                        { alterRecordUserId: consumeUserId },
                    ];
                }
                else if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    conditionObject["$or"] = [{ userId: consumeUserId }, { alterRecordUserId: consumeUserId }];
                    if (!(filter && filter.companyId)) {
                        const teamMemberData = yield customers_repo_1.default.getCompanyListFromTeammember(consumeUserId);
                        if (teamMemberData && teamMemberData.length) {
                            const companyArray = teamMemberData.map((filter) => {
                                return filter.companyId;
                            });
                            conditionObject["$or"].push({ companyId: { $in: companyArray } });
                        }
                    }
                }
                if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    if (filter) {
                        if (filter.userId) {
                            conditionObject["$or"] = [
                                { userId: filter.userId },
                                { alterRecordUserId: filter.userId },
                            ];
                            let user = yield users_repo_1.default.searchUser({ id: filter.userId });
                            if (!user) {
                                return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.RECORD_NOT_FOUND);
                            }
                            if (consumeUserRole !== constants_1.ENUM_User_ROLE.SUPERADMIN) {
                                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, user.role);
                            }
                        }
                        if (filter.eventTypeId) {
                            conditionObject["eventTypeId"] = filter.eventTypeId;
                        }
                        if (filter.companyId) {
                            delete conditionObject["$or"];
                            conditionObject["companyId"] = filter.companyId;
                        }
                        if (filter.documentId) {
                            delete conditionObject["$or"];
                            conditionObject["documentId"] = filter.documentId;
                        }
                    }
                }
                else {
                    if (filter) {
                        if (filter.eventTypeId) {
                            conditionObject["eventTypeId"] = filter.eventTypeId;
                        }
                        if (filter.companyId) {
                            conditionObject["companyId"] = filter.companyId;
                        }
                        if (filter.documentId) {
                            conditionObject["documentId"] = filter.documentId;
                        }
                        if (filter.userId) {
                            conditionObject["$or"] = [
                                { userId: filter.userId },
                                { alterRecordUserId: filter.userId },
                            ];
                            let user = yield users_repo_1.default.searchUser({ id: filter.userId });
                            if (!user) {
                                return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.RECORD_NOT_FOUND);
                            }
                            if (consumeUserRole !== constants_1.ENUM_User_ROLE.SUPERADMIN) {
                                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, user.role);
                            }
                        }
                    }
                }
                const { totalRecordCount, totalRecord } = yield eventlogs_repo_1.default.getDocumentTypeFetchList(conditionObject, sortObject, currentPage, recordPerPage);
                const totalPages = Math.ceil(totalRecordCount / recordPerPage);
                const data = {
                    records: totalRecord,
                    recordsMetaData: {
                        recordPerPage,
                        currentPage,
                        totalPages,
                        totalRecords: totalRecordCount,
                    },
                    conditionObject,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(["fetchEventTypes", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    superAdminFetchEventTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { filter, sortBy, currentPage, recordPerPage }, } = req;
                const sortObject = { createdAt: -1 };
                const conditionObject = {};
                conditionObject["userRoleId"] = {
                    $in: [
                        constants_1.ENUM_User_ROLE.SUPERADMIN,
                        constants_1.ENUM_User_ROLE.ADMIN,
                        constants_1.ENUM_User_ROLE.TEAM_MEMBER,
                        constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                    ],
                };
                conditionObject["alterRecordUserRoleId"] = {
                    $in: [
                        constants_1.ENUM_User_ROLE.SUPERADMIN,
                        constants_1.ENUM_User_ROLE.ADMIN,
                        constants_1.ENUM_User_ROLE.TEAM_MEMBER,
                        constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                    ],
                };
                if (filter) {
                    if (filter.eventTypeId) {
                        conditionObject["eventTypeId"] = filter.eventTypeId;
                    }
                    if (filter.companyId) {
                        conditionObject["companyId"] = filter.companyId;
                    }
                    if (filter.userId) {
                        conditionObject["$or"] = [];
                        conditionObject["$or"].push({ userId: filter.userId });
                        conditionObject["$or"].push({ alterRecordUserId: filter.userId });
                        let user = yield users_repo_1.default.searchUser({ id: filter.userId });
                        if (!user) {
                            return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.RECORD_NOT_FOUND);
                        }
                    }
                    if (filter.documentId) {
                        conditionObject["documentId"] = filter.documentId;
                    }
                }
                const { totalRecordCount, totalRecord } = yield eventlogs_repo_1.default.getDocumentTypeFetchList(conditionObject, sortObject, currentPage, recordPerPage);
                const totalPages = Math.ceil(totalRecordCount / recordPerPage);
                const data = {
                    records: totalRecord,
                    recordsMetaData: {
                        recordPerPage,
                        currentPage,
                        totalPages,
                        totalRecords: totalRecordCount,
                    },
                    conditionObject,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    eventTypeId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, params: { id: eventLogId }, } = req;
                const records = yield eventlogs_repo_1.default.getEventLogDetail(eventLogId);
                if (records) {
                    const finalResult = records.toObject();
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, finalResult);
                }
                else {
                    throw new unProcessableError_1.default(message_1.default.RECORD_NOT_FOUND);
                }
            }
            catch (Error) {
                logs_1.default.error(["eventTypeId", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
}
exports.default = new CustomerController();
