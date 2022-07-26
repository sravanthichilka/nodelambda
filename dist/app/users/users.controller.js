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
const users_repo_1 = __importDefault(require("./users.repo"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const logs_1 = __importDefault(require("../../helper/logs"));
const constants_1 = require("../../helper/constants");
const mail_ses_1 = require("../../helper/mail_ses");
const emailTemplates_1 = __importDefault(require("../../templates/emailTemplates"));
const message_1 = __importDefault(require("../../helper/message"));
const app_1 = __importDefault(require("../../config/app"));
const customEventType_1 = __importDefault(require("../../customEvents/customEventType"));
const customEventMessage_1 = __importDefault(require("../../customEvents/customEventMessage"));
class UserController extends auth_helper_1.default {
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { filter, viewRoleList, sortBy, currentPage, recordPerPage }, } = req;
                const sqlQuery = [];
                const sqlQueryParams = [];
                const sortObject = { column: "u.id", order: "desc" };
                const pageLimitObj = {
                    limit: recordPerPage,
                    offset: recordPerPage * currentPage - recordPerPage,
                };
                sqlQuery.push(` u.id != ? `);
                sqlQueryParams.push(consumeUserId);
                if (constants_1.ENUM_User_ROLE.SUPERADMIN === consumeUserRole) {
                    if (viewRoleList) {
                        sqlQuery.push(` u.role = ?`);
                        sqlQueryParams.push(viewRoleList);
                    }
                    else {
                        sqlQuery.push(` u.role in (?,?,?) `);
                        sqlQueryParams.push(constants_1.ENUM_User_ROLE.SUPERADMIN);
                        sqlQueryParams.push(constants_1.ENUM_User_ROLE.ADMIN);
                        sqlQueryParams.push(constants_1.ENUM_User_ROLE.TEAM_MEMBER);
                    }
                }
                else if (constants_1.ENUM_User_ROLE.ADMIN === consumeUserRole) {
                    sqlQuery.push(` u.role = ? `);
                    sqlQueryParams.push(constants_1.ENUM_User_ROLE.TEAM_MEMBER);
                }
                if (filter) {
                    if (filter.firstLastAndEmail) {
                        sqlQuery.push(`( u.firstName like ? or u.lastName like ? or u.email like ? )`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                    }
                    if (filter.regionId) {
                        sqlQuery.push(` u.regionId = ?`);
                        sqlQueryParams.push(filter.regionId);
                    }
                }
                if (sortBy) {
                    for (let sortByKey in sortBy) {
                        if (["firstName", "lastName", "email", "status", "role"].includes(sortByKey)) {
                            sortObject.column = sortByKey;
                            sortObject.order = sortBy[sortByKey];
                        }
                    }
                }
                let sqlQueryBuilder = sqlQuery.join(" and ");
                let sqlQueryBuilderList = sqlQueryParams;
                let userListCountPromise = users_repo_1.default.getUsersListCount(sqlQueryBuilder, sqlQueryBuilderList, {
                    sortObject,
                });
                let userListPromise = users_repo_1.default.getUsersList(sqlQueryBuilder, sqlQueryBuilderList, {
                    sortObject,
                    pageLimit: pageLimitObj,
                });
                Promise.all([userListCountPromise, userListPromise])
                    .then((values) => {
                    let [userListCount, userList] = values;
                    const totalPages = Math.ceil(userListCount / recordPerPage);
                    const data = {
                        viewRoleList,
                        records: userList,
                        recordsMetaData: {
                            recordPerPage,
                            currentPage,
                            totalPages,
                            totalRecords: userListCount,
                        },
                    };
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
                })
                    .catch((e) => {
                    return res.sendErrorResponse(http_status_codes_1.default.INTERNAL_SERVER_ERROR, message_1.default.SOMETHING_WENT_WRONG, { error: e });
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    addUser(req, res) {
        const _super = Object.create(null, {
            createSalt: { get: () => super.createSalt },
            createHash: { get: () => super.createHash }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { role, firstName, lastName, email, temporaryPassword, regionId, phoneNumber }, userAgent, } = req;
                const websiteLink = app_1.default.web.LINK;
                const createSaltPromise = _super.createSalt.call(this);
                let user = {};
                user.firstName = firstName;
                user.lastName = lastName;
                user.email = email;
                user.role = role;
                user.setTemporaryPassword = 1;
                if (constants_1.ENUM_User_ROLE.TEAM_MEMBER === role) {
                    user.regionId = regionId;
                    user.phoneNumber = phoneNumber;
                }
                const salt = yield createSaltPromise;
                const hash = yield _super.createHash.call(this, salt, email, temporaryPassword);
                user.salt = salt;
                user.hash = hash;
                if (constants_1.ENUM_User_ROLE.ADMIN === consumeUserRole) {
                    if (constants_1.ENUM_User_ROLE.SUPERADMIN === role || constants_1.ENUM_User_ROLE.ADMIN === role) {
                        return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.CANNOT_ADD_USER_BY_ADMIN);
                    }
                }
                let userId;
                try {
                    userId = (yield users_repo_1.default.createUser(user, consumeUserId));
                }
                catch (error) {
                    let message = error.sqlMgs;
                    if (error.errNo === 1062) {
                        message = message_1.default.EMAILT_ALREADY_EXIST;
                    }
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message, { error: error.sqlMgs });
                }
                const mailSetTemporaryPasswordData = {
                    websiteLink: websiteLink,
                    firstName: user.firstName,
                    userEmail: user.email,
                    temporaryPassword: req.body.temporaryPassword,
                };
                mail_ses_1.sendEmail([user.email], emailTemplates_1.default.welcomeEmail.subject, emailTemplates_1.default.welcomeEmail.returnHtml(mailSetTemporaryPasswordData));
                // event log
                let eventLogInt = 10000;
                let eventTypeLabel = "10000";
                switch (role) {
                    case constants_1.ENUM_User_ROLE.SUPERADMIN:
                        eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_CREATED.id;
                        eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_CREATED.eventTypeName;
                        break;
                    case constants_1.ENUM_User_ROLE.ADMIN:
                        eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_CREATED.id;
                        eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_CREATED.eventTypeName;
                        break;
                    case constants_1.ENUM_User_ROLE.TEAM_MEMBER:
                        eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_CREATED.id;
                        eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_CREATED.eventTypeName;
                        break;
                }
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: userId,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: role,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.USER_CREATED.replace("%loginUserName%", fullName).replace("%createdBy%", firstName + " " + lastName),
                };
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.CREATED, message_1.default.USER_CREATED_SUCCESSFULLY, {
                    id: userId,
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    updateUser(req, res) {
        const _super = Object.create(null, {
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { role }, params: { userId }, userAgent, } = req;
                let user = yield users_repo_1.default.searchUser({ id: userId });
                if (!user) {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.RECORD_NOT_FOUND);
                }
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, user.role);
                if (user.role === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    if (!req.body.regionId || !req.body.phoneNumber) {
                        return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.RECORD_NOT_FOUND);
                    }
                    user.phoneNumber = req.body.phoneNumber;
                    user.regionId = req.body.regionId;
                }
                else {
                    user.phoneNumber = null;
                    user.regionId = null;
                }
                const previousUserMetaData = yield users_repo_1.default.userMetaData(userId);
                delete user.id;
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                yield users_repo_1.default.updateUser(userId, user);
                let updateData = yield users_repo_1.default.searchUser({ id: userId });
                // event log
                let eventLogInt = 10002;
                let eventTypeLabel = "10002";
                switch (user.role) {
                    case constants_1.ENUM_User_ROLE.SUPERADMIN:
                        eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_UPDATED.id;
                        eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_UPDATED.eventTypeName;
                        break;
                    case constants_1.ENUM_User_ROLE.ADMIN:
                        eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_UPDATED.id;
                        eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_UPDATED.eventTypeName;
                        break;
                    case constants_1.ENUM_User_ROLE.TEAM_MEMBER:
                        eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_UPDATED.id;
                        eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_UPDATED.eventTypeName;
                        break;
                }
                const currentUserMetaData = yield users_repo_1.default.userMetaData(userId);
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: userId,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: user.role,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.USER_UPDATED.replace("%loginUserName%", fullName).replace("%user2%", updateData.firstName + " " + updateData.lastName),
                };
                addEventData.changes = {
                    meta: {
                        label: "User Update",
                        previous_value_updated_user_id: previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
                        previous_value_updated_by: previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
                        previous_value_updated_on: previousUserMetaData.userUpdatedAt || previousUserMetaData.userCreatedAt,
                        current_value_updated_user_id: consumeUserId,
                        current_value_updated_by: consumeUserFullName,
                        current_value_updated_on: currentUserMetaData.userUpdatedAt || currentUserMetaData.userCreatedAt,
                    },
                    event_changes: [
                        {
                            label: "First Name",
                            previous_value: previousUserMetaData.firstName,
                            current_value: updateData.firstName,
                        },
                        {
                            label: "Last Name",
                            previous_value: previousUserMetaData.lastName,
                            current_value: updateData.lastName,
                        },
                        {
                            label: "Email",
                            previous_value: previousUserMetaData.email,
                            current_value: updateData.email,
                        },
                    ],
                };
                if (user.role === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    addEventData.changes.event_changes.push({
                        label: "Region",
                        previous_value: previousUserMetaData.regionName,
                        current_value: currentUserMetaData.regionName,
                    });
                }
                customEventType_1.default.emit("add-event", addEventData);
                const data = {
                    id: updateData.id,
                    firstName: updateData.firstName,
                    lastName: updateData.lastName,
                    email: updateData.email,
                    role: updateData.role,
                    phoneNumber: updateData.phoneNumber,
                    regionId: updateData.regionId,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.PROFILE_UPDATE_SUCCESSFULLY, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    patchUserStatus(req, res) {
        const _super = Object.create(null, {
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userAgent, user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { status }, params: { userId }, } = req;
                const condition = { id: userId };
                const userFind = yield users_repo_1.default.searchUser(condition);
                if (!userFind) {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.RECORD_NOT_FOUND);
                }
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, userFind.role);
                let updateUserCondition = {};
                updateUserCondition.status = status;
                delete userFind.id;
                if (userFind.status !== status) {
                    yield users_repo_1.default.updateUser(userId, updateUserCondition);
                    // event log
                    let eventLogInt = 10001;
                    let eventTypeLog = "10001";
                    let eventTypeLabel = "10001";
                    switch (status) {
                        case constants_1.ENUM_User_Status.ACTIVE:
                            if (userFind.role === constants_1.ENUM_User_ROLE.SUPERADMIN) {
                                eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_ACTIVATED.id;
                                eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_ACTIVATED.eventTypeName;
                            }
                            else if (userFind.role === constants_1.ENUM_User_ROLE.ADMIN) {
                                eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_ACTIVATED.id;
                                eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_ACTIVATED.eventTypeName;
                            }
                            else if (userFind.role === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                                eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_ACTIVATED.id;
                                eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_ACTIVATED.eventTypeName;
                            }
                            eventTypeLog = customEventMessage_1.default.USER_ACTIVE;
                            break;
                        case constants_1.ENUM_User_Status.INACTIVE:
                            eventTypeLog = customEventMessage_1.default.USER_DEACTIVE;
                            if (userFind.role === constants_1.ENUM_User_ROLE.SUPERADMIN) {
                                eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_DEACTIVATED.id;
                                eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_DEACTIVATED.eventTypeName;
                            }
                            else if (userFind.role === constants_1.ENUM_User_ROLE.ADMIN) {
                                eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_DEACTIVATED.id;
                                eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.ADMIN_DEACTIVATED.eventTypeName;
                            }
                            else if (userFind.role === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                                eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_DEACTIVATED.id;
                                eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_DEACTIVATED.eventTypeName;
                            }
                            break;
                    }
                    const fullName = consumeUserFullName;
                    const addEventData = {
                        alterRecordUserId: userId,
                        userId: consumeUserId,
                        userRoleId: consumeUserRole,
                        alterRecordUserRoleId: userFind.role,
                        userName: fullName,
                        eventTypeId: eventLogInt,
                        eventTypeLabel,
                        userAgent,
                        eventMessage: eventTypeLog
                            .replace("%loginUserName%", fullName)
                            .replace("%user2%", userFind.fullName),
                    };
                    customEventType_1.default.emit("add-event", addEventData);
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.STATUS_CHANGE_SUCCESSFULLY);
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.STATUS_IS_ALREADY_SAME);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    pathSetTemporaryPassword(req, res) {
        const _super = Object.create(null, {
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            createSalt: { get: () => super.createSalt },
            createHash: { get: () => super.createHash }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { setTemporaryPassword }, params: { userId }, userAgent, } = req;
                const websiteLink = app_1.default.web.LINK;
                const condition = { id: userId };
                const userFind = yield users_repo_1.default.searchUser(condition);
                if (!userFind) {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.RECORD_NOT_FOUND);
                }
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, userFind.role);
                if (userFind.status === constants_1.ENUM_User_Status.PENDING) {
                    return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.CANNOT_RESET_PASSWORD_PENDING_STATUS_USER);
                }
                let salt = userFind.salt;
                if (!userFind.salt) {
                    salt = yield _super.createSalt.call(this);
                }
                const hash = yield _super.createHash.call(this, salt, userFind.email, setTemporaryPassword);
                const updateUserDate = { setTemporaryPassword: 1, salt, hash };
                const isUserUpdated = yield users_repo_1.default.updateUser(userId, updateUserDate);
                logs_1.default.info([condition, "patchSetPassword"]);
                if (isUserUpdated) {
                    const user_email = userFind.email;
                    const mailSetTemporaryPasswordData = {
                        websiteLink: websiteLink,
                        firstName: userFind.firstName,
                        userEmail: userFind.email,
                        temporaryPassword: setTemporaryPassword,
                    };
                    mail_ses_1.sendEmail([user_email], emailTemplates_1.default.setTemporaryPassword.subject, emailTemplates_1.default.setTemporaryPassword.returnHtml(mailSetTemporaryPasswordData));
                    // event log
                    const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.id;
                    const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.eventTypeName;
                    const addEventData = {
                        alterRecordUserId: userId,
                        userId: consumeUserId,
                        userRoleId: consumeUserRole,
                        alterRecordUserRoleId: userFind.role,
                        userName: consumeUserFullName,
                        eventTypeId: eventLogInt,
                        eventTypeLabel,
                        userAgent,
                        eventMessage: customEventMessage_1.default.RESET_PASSWORD_OTHER.replace("%loginUserName%", consumeUserFullName).replace("%user2%", userFind.firstName + " " + userFind.lastName),
                    };
                    customEventType_1.default.emit("add-event", addEventData);
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.SET_TEMPORARY_PASSWORD);
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
