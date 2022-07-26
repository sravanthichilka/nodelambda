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
const auth_helper_1 = __importDefault(require("../../auth/auth.helper"));
const logs_1 = __importDefault(require("../../../helper/logs"));
const users_repo_1 = __importDefault(require("../users.repo"));
const constants_1 = require("../../../helper/constants");
const message_1 = __importDefault(require("../../../helper/message"));
const eventlogs_repo_1 = __importDefault(require("../../eventLogs/eventlogs.repo"));
class UserController extends auth_helper_1.default {
    userProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, } = req;
                let user = yield users_repo_1.default.searchUser({ id: consumeUserId });
                delete user.id;
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER ||
                    consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER) {
                    user.phoneNumber = req.body.phoneNumber;
                }
                yield users_repo_1.default.updateUser(consumeUserId, user);
                let updateData = yield users_repo_1.default.searchUser({ id: consumeUserId });
                const data = {
                    id: updateData.id,
                    firstName: updateData.firstName,
                    lastName: updateData.lastName,
                    email: updateData.email,
                    phoneNumber: updateData.phoneNumber,
                    regionId: updateData.regionId,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.EDIT_PROFILE_SUCCESSFULLY, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    userMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, } = req;
                let user = yield users_repo_1.default.searchUser({ id: consumeUserId });
                delete user.salt;
                delete user.hash;
                const data = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    regionId: user.regionId,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.MY_PROFILE_DATA, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    myEventLog(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { filter, sortBy, currentPage, recordPerPage }, } = req;
                const sortObject = { createdAt: -1 };
                const conditionObject = { userId: consumeUserId };
                if (filter) {
                    if (filter.eventTypeId) {
                        conditionObject["eventTypeId"] = filter.eventTypeId;
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
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    setPassword(req, res) {
        const _super = Object.create(null, {
            createHash: { get: () => super.createHash }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId }, body: { password }, } = req;
                const condition = { id: consumeUserId };
                logs_1.default.info([condition, "setPassword"]);
                const userFind = yield users_repo_1.default.searchUser(condition);
                if (!userFind.setTemporaryPassword) {
                    return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.NOT_AUTHORIZED_TO_SET_PASSWORD);
                }
                let salt = userFind.salt;
                const hash = yield _super.createHash.call(this, salt, userFind.email, password);
                const updateUserDate = { setTemporaryPassword: 0, salt, hash };
                if (userFind.status === constants_1.ENUM_User_Status.PENDING) {
                    updateUserDate.status = constants_1.ENUM_User_Status.ACTIVE;
                }
                const isUserUpdated = yield users_repo_1.default.updateUser(consumeUserId, updateUserDate);
                logs_1.default.info([condition, "setPassword"]);
                if (isUserUpdated) {
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.PASSWORD_CHANGE_SUCCESSFULLY);
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.INTERNAL_SERVER_ERROR, message_1.default.SOMETHING_WENT_WRONG);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
}
exports.default = new UserController();
