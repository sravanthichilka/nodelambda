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
const customers_repo_1 = __importDefault(require("./customers.repo"));
const users_repo_1 = __importDefault(require("../users/users.repo"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const logs_1 = __importDefault(require("../../helper/logs"));
const constants_1 = require("../../helper/constants");
const mail_ses_1 = require("../../helper/mail_ses");
const emailTemplates_1 = __importDefault(require("../../templates/emailTemplates"));
const app_1 = __importDefault(require("../../config/app"));
const documents_repo_1 = __importDefault(require("../documents/documents.repo"));
const documenttypes_repo_1 = __importDefault(require("../documenttypes/documenttypes.repo"));
const s3_service_1 = require("../../helper/s3-service");
const message_1 = __importDefault(require("../../helper/message"));
const forbiddenError_1 = __importDefault(require("../../helper/error/forbiddenError"));
const lambda_1 = require("../../helper/lambda");
const customEventType_1 = __importDefault(require("../../customEvents/customEventType"));
const customEventMessage_1 = __importDefault(require("../../customEvents/customEventMessage"));
class CustomerController extends auth_helper_1.default {
    getCustomers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id, role: consumeUserRole }, query: { filter, sortBy, currentPage, recordPerPage }, } = req;
                const sqlQuery = [];
                const sqlQueryParams = [];
                const sortObject = { column: "c.id", order: "desc" };
                const pageLimitObj = {
                    limit: recordPerPage,
                    offset: recordPerPage * currentPage - recordPerPage,
                };
                sqlQuery.push(` u.role = ? `);
                sqlQueryParams.push(constants_1.ENUM_User_ROLE.CUSTOMER_USER);
                sqlQuery.push(` cu.isCompanyOwner = ? `);
                sqlQueryParams.push(true);
                if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    sqlQuery.push(` atm.assignUserId = ? `);
                    sqlQueryParams.push(id);
                }
                if (filter) {
                    if (filter.firstLastAndUnique) {
                        sqlQuery.push(`( u.firstName like ? or u.lastName like ? or c.uniqueId like ? )`);
                        sqlQueryParams.push(`%${filter.firstLastAndUnique}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndUnique}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndUnique}%`);
                    }
                    if (filter.regionId) {
                        sqlQuery.push(` c.regionId = ?`);
                        sqlQueryParams.push(filter.regionId);
                    }
                }
                if (sortBy) {
                    for (let sortByKey in sortBy) {
                        if (["companyName", "uniqueId", "firstName", "lastName", "email", "status"].includes(sortByKey)) {
                            sortObject.column = sortByKey;
                            sortObject.order = sortBy[sortByKey];
                        }
                    }
                }
                let sqlQueryBuilder = sqlQuery.join(" and ");
                let sqlQueryBuilderList = sqlQueryParams;
                let userListCountPromise = customers_repo_1.default.getCompanyListCount(sqlQueryBuilder, sqlQueryBuilderList, { sortObject });
                let userListPromise = customers_repo_1.default.getCompanyList(sqlQueryBuilder, sqlQueryBuilderList, {
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
    addCustomer(req, res) {
        const _super = Object.create(null, {
            createSalt: { get: () => super.createSalt },
            createHash: { get: () => super.createHash }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { customerUser, companyInfo }, userAgent, } = req;
                let { body: { assignedTeamMember }, } = req;
                if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    assignedTeamMember = [consumeUserId];
                }
                const isAllIdsAreTeamMembers = yield customers_repo_1.default.checkAllTeamMemberIds(assignedTeamMember);
                if (isAllIdsAreTeamMembers.length !== assignedTeamMember.length) {
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message_1.default.ALL_IDS_ARE_NOT_TEAM_MEMBERS);
                }
                const salt = yield _super.createSalt.call(this);
                const hash = yield _super.createHash.call(this, salt, customerUser.email, customerUser.temporaryPassword);
                customerUser.salt = salt;
                customerUser.hash = hash;
                customerUser.setTemporaryPassword = 1;
                customerUser.role = constants_1.ENUM_User_ROLE.CUSTOMER_USER;
                const temporaryPassword = customerUser.temporaryPassword;
                delete customerUser.temporaryPassword;
                const addCompany = { customerUser, companyInfo, assignedTeamMember };
                let userAndCompanyAndTeamMemberObjId;
                try {
                    userAndCompanyAndTeamMemberObjId = yield customers_repo_1.default.createUser(addCompany, consumeUserId);
                }
                catch (error) {
                    let message = error.sqlMgs;
                    if (error.errNo === 1062) {
                        if (message.includes("users.users_email_unique")) {
                            message = message_1.default.EMAIL_ALREADY_EXIST;
                        }
                        else if (message.includes("companies.companies_companyname_unique")) {
                            message = message_1.default.COMPANY_NAME_ALREADY_EXIST;
                        }
                        else if (message.includes("companies.companies_uniqueid_unique")) {
                            message = message_1.default.COMPANY_UNIQUE_ALREADY_EXIST;
                        }
                    }
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message, {
                        error: error.sqlMgs,
                        error1: error,
                    });
                }
                const websiteLink = app_1.default.web.LINK;
                const mailSetTemporaryPasswordData = {
                    websiteLink: websiteLink,
                    firstName: customerUser.firstName,
                    userEmail: customerUser.email,
                    temporaryPassword: temporaryPassword,
                };
                mail_ses_1.sendEmail([customerUser.email], emailTemplates_1.default.welcomeEmail.subject, emailTemplates_1.default.welcomeEmail.returnHtml(mailSetTemporaryPasswordData));
                // event log
                const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_CREATED.id;
                const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_CREATED.eventTypeName;
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: userAndCompanyAndTeamMemberObjId.userId,
                    companyId: userAndCompanyAndTeamMemberObjId.companyId,
                    companyName: companyInfo.companyName,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.USER_CREATED.replace("%loginUserName%", fullName).replace("%createdBy%", customerUser.firstName + " " + customerUser.lastName),
                };
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.CREATED, message_1.default.COMPANY_CREATED, {
                    id: userAndCompanyAndTeamMemberObjId.companyId,
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    putCustomer(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { customerUser, companyInfo }, params: { companyId }, userAgent, } = req;
                let { body: { assignedTeamMember }, } = req;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                if (companyData.userStatus == constants_1.ENUM_User_Status.INACTIVE) {
                    return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                }
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, companyData.userRole);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                const isAllIdsAreTeamMembers = yield customers_repo_1.default.checkAllTeamMemberIds(assignedTeamMember);
                if (isAllIdsAreTeamMembers.length !== assignedTeamMember.length) {
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message_1.default.ALL_IDS_ARE_NOT_TEAM_MEMBERS);
                }
                const companyAliasUserId = (yield customers_repo_1.default.getUserIdFromCompanyId(companyId));
                const updateCompany = { customerUser, companyInfo, assignedTeamMember };
                const isCompanyNameUnique = yield customers_repo_1.default.isCompanyNameUnique(companyInfo.companyName, companyId);
                if (!isCompanyNameUnique) {
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message_1.default.COMPANY_NAME_ALREADY_EXIST);
                }
                const isCompanyUniqueIdUnique = yield customers_repo_1.default.isCompanyUniqueIdUnique(companyInfo.uniqueId, companyId);
                if (!isCompanyUniqueIdUnique) {
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message_1.default.COMPANY_UNIQUE_ALREADY_EXIST);
                }
                const previousUserMetaData = yield customers_repo_1.default.companyMetaData(companyId);
                const previousCompanyAssignTeamMemberMetaList = yield customers_repo_1.default.companyAssignTeamMemberMetaList(companyId);
                const previousCompanyAssignTML = previousCompanyAssignTeamMemberMetaList.map((rec) => rec.id);
                let userAndCompanyAndTeamMemberObjId;
                try {
                    // for team member- assign_team_members will not effect. it will remain same
                    userAndCompanyAndTeamMemberObjId = yield customers_repo_1.default.updateCompany(consumeUserRole, companyAliasUserId, updateCompany, consumeUserId);
                }
                catch (error) {
                    let message = error.sqlMgs;
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message, { error: error.sqlMgs });
                }
                const currentUserMetaData = yield customers_repo_1.default.companyMetaData(companyId);
                const currentCompanyAssignTeamMemberMetaList = yield customers_repo_1.default.companyAssignTeamMemberMetaList(companyId);
                let previouslyRemoved = previousCompanyAssignTeamMemberMetaList.filter((x) => !assignedTeamMember.includes(x.id));
                let exitBothTmList = previousCompanyAssignTeamMemberMetaList.filter((x) => assignedTeamMember.includes(x.id));
                let currentAdded = currentCompanyAssignTeamMemberMetaList.filter((x) => !previousCompanyAssignTML.includes(x.id));
                let maxLoopTMLLIST = currentAdded.length > previouslyRemoved.length
                    ? currentAdded.length
                    : previouslyRemoved.length;
                let assignedTMAuditList = [];
                for (let i = 0; i < maxLoopTMLLIST; i++) {
                    assignedTMAuditList.push({
                        label: "",
                        previous_value: previouslyRemoved[i]
                            ? previouslyRemoved[i]["firstName"] + " " + previouslyRemoved[i]["lastName"]
                            : "",
                        previous_sub_heading: previouslyRemoved[i] ? previouslyRemoved[i]["email"] : "",
                        current_value: currentAdded[i]
                            ? currentAdded[i]["firstName"] + " " + currentAdded[i]["lastName"]
                            : "",
                        current_sub_heading: currentAdded[i] ? currentAdded[i]["email"] : "",
                    });
                }
                for (let rec of exitBothTmList) {
                    assignedTMAuditList.push({
                        label: "",
                        previous_value: rec["firstName"] + " " + rec["lastName"],
                        previous_sub_heading: rec["email"],
                        current_value: rec["firstName"] + " " + rec["lastName"],
                        current_sub_heading: rec["email"],
                    });
                }
                // event log
                const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_UPDATED.id;
                const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_UPDATED.eventTypeName;
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: companyData.userId,
                    companyId,
                    companyName: companyData.companyName,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: companyData.userRole,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.USER_UPDATED.replace("%loginUserName%", fullName).replace("%user2%", customerUser.firstName + " " + customerUser.lastName),
                };
                addEventData.changes = [
                    {
                        meta: {
                            label: "Customer Info",
                            previous_value_updated_user_id: previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
                            previous_value_updated_by: previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
                            previous_value_updated_on: previousUserMetaData.companyUpdatedAt || previousUserMetaData.companyCreatedAt,
                            current_value_updated_user_id: consumeUserId,
                            current_value_updated_by: consumeUserFullName,
                            current_value_updated_on: currentUserMetaData.companyUpdatedAt || currentUserMetaData.companyCreatedAt,
                        },
                        event_changes: [
                            {
                                label: "Account Name",
                                previous_value: previousUserMetaData.companyName,
                                current_value: companyInfo.companyName,
                            },
                            {
                                label: "Address",
                                previous_value: previousUserMetaData.companyAddress,
                                current_value: companyInfo.companyAddress,
                            },
                            {
                                label: "Unique Id",
                                previous_value: previousUserMetaData.uniqueId,
                                current_value: companyInfo.uniqueId,
                            },
                            {
                                label: "Region",
                                previous_value: previousUserMetaData.companyRegionName,
                                current_value: currentUserMetaData.companyRegionName,
                            },
                            {
                                label: "First Name",
                                previous_value: previousUserMetaData.firstName,
                                current_value: customerUser.firstName,
                            },
                            {
                                label: "Last Name",
                                previous_value: previousUserMetaData.lastName,
                                current_value: customerUser.lastName,
                            },
                            {
                                label: "Email",
                                previous_value: previousUserMetaData.email,
                                current_value: currentUserMetaData.email,
                            },
                        ],
                    },
                    {
                        meta: {
                            label: "Assigned Team Members",
                            previous_value_updated_user_id: previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
                            previous_value_updated_by: previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
                            previous_value_updated_on: previousUserMetaData.companyUpdatedAt || previousUserMetaData.companyCreatedAt,
                            current_value_updated_user_id: consumeUserId,
                            current_value_updated_by: consumeUserFullName,
                            current_value_updated_on: currentUserMetaData.companyUpdatedAt || currentUserMetaData.companyCreatedAt,
                        },
                        event_changes: assignedTMAuditList,
                    },
                ];
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.COMPANY_PROFILE_UPDATED, {
                    id: companyId,
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    patchCustomerStatus(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // status should be 1 or 2
                const { userAgent, user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { status }, params: { companyId }, } = req;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                const { userId } = (yield customers_repo_1.default.getUserIdFromCompanyId(companyId));
                const condition = { id: userId, role: constants_1.ENUM_User_ROLE.CUSTOMER_USER };
                logs_1.default.info([condition, "patchCustomerStatus"]);
                const userFind = yield users_repo_1.default.searchUser(condition);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, userFind.role);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                if (userFind.status !== status) {
                    try {
                        yield customers_repo_1.default.updateCompanyStatus(companyId, status);
                    }
                    catch (e) {
                        return res.sendErrorResponse(http_status_codes_1.default.SERVICE_UNAVAILABLE, e.message, {
                            errors: e.message,
                        });
                    }
                    // event log
                    let eventLogInt = 10003;
                    let eventTypeLog = "10003";
                    let eventTypeLabel = "1003";
                    switch (status) {
                        case constants_1.ENUM_User_Status.ACTIVE:
                            eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_ACTIVATED.id;
                            eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_ACTIVATED.eventTypeName;
                            eventTypeLog = customEventMessage_1.default.USER_ACTIVE;
                            break;
                        case constants_1.ENUM_User_Status.INACTIVE:
                            eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_DEACTIVATED.id;
                            eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_DEACTIVATED.eventTypeName;
                            eventTypeLog = customEventMessage_1.default.USER_DEACTIVE;
                            break;
                    }
                    const fullName = consumeUserFullName;
                    const addEventData = {
                        alterRecordUserId: userId,
                        companyId,
                        companyName: companyData.companyName,
                        userId: consumeUserId,
                        userRoleId: consumeUserRole,
                        alterRecordUserRoleId: constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                        userName: fullName,
                        eventTypeId: eventLogInt,
                        eventTypeLabel,
                        userAgent,
                        eventMessage: eventTypeLog
                            .replace("%loginUserName%", fullName)
                            .replace("%user2%", userFind.fullName),
                    };
                    customEventType_1.default.emit("add-event", addEventData);
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.STATUS_CHANGED_SUCCESSFULLY);
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.STATUS_ALREADY_SAME);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    getCompanyDetail(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany },
            validateIsCompayUserAssignToCompany: { get: () => super.validateIsCompayUserAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, body: { status }, params: { companyId }, } = req;
                yield _super.validateCompanyId.call(this, companyId);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                if (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER) {
                    yield _super.validateIsCompayUserAssignToCompany.call(this, consumeUserId, companyId);
                }
                const companydetailPromise = customers_repo_1.default.companydetail(companyId);
                const companyDetail = yield companydetailPromise;
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.COMPANY_DETAIL, companyDetail);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    addCompanyUser(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany },
            createSalt: { get: () => super.createSalt },
            createHash: { get: () => super.createHash }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { firstName, lastName, email, temporaryPassword }, params: { companyId }, userAgent, } = req;
                const websiteLink = app_1.default.web.LINK;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, companyData.userRole);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                let user = {};
                user.firstName = firstName;
                user.lastName = lastName;
                user.email = email;
                user.role = constants_1.ENUM_User_ROLE.CUSTOMER_USER;
                user.setTemporaryPassword = 1;
                const salt = yield _super.createSalt.call(this);
                const hash = yield _super.createHash.call(this, salt, email, temporaryPassword);
                user.salt = salt;
                user.hash = hash;
                let userId;
                try {
                    userId = (yield customers_repo_1.default.createCompanyUser(consumeUserId, companyId, user));
                }
                catch (error) {
                    let message = error.sqlMgs;
                    if (error.errNo === 1062) {
                        message = message_1.default.EMAILT_ALREADY_EXIST;
                    }
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message, { error: error.sqlMg });
                }
                const mailSetTemporaryPasswordData = {
                    websiteLink: websiteLink,
                    firstName: user.firstName,
                    userEmail: user.email,
                    temporaryPassword: req.body.temporaryPassword,
                };
                mail_ses_1.sendEmail([user.email], emailTemplates_1.default.welcomeEmail.subject, emailTemplates_1.default.welcomeEmail.returnHtml(mailSetTemporaryPasswordData));
                // event log
                const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_CREATED.id;
                const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_CREATED.eventTypeName;
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: userId,
                    companyId,
                    companyName: companyData.companyName,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.USER_CREATED.replace("%loginUserName%", fullName).replace("%createdBy%", firstName + " " + lastName),
                };
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.CREATED, message_1.default.COMPANY_USER_CREATED, {
                    id: userId,
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    companyUserList(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { filter, sortBy, currentPage, recordPerPage }, params: { companyId: companyId1 }, } = req;
                const sqlQuery = [];
                const sqlQueryParams = [];
                const companyId = parseInt(companyId1);
                const condition = {};
                const sortObject = { column: "u.id", order: "desc" };
                const pageLimitObj = {
                    limit: recordPerPage,
                    offset: recordPerPage * currentPage - recordPerPage,
                };
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, companyData.userRole);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                sqlQuery.push(` u.id != ? `);
                sqlQueryParams.push(consumeUserId);
                sqlQuery.push(` cu.companyId = ? `);
                sqlQueryParams.push(companyId);
                sqlQuery.push(` u.role = ? `);
                sqlQueryParams.push(constants_1.ENUM_User_ROLE.CUSTOMER_USER);
                if (filter) {
                    if (filter.firstLastAndEmail) {
                        sqlQuery.push(`( u.firstName like ? or  u.lastName like ? or  u.email like ? )`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                        sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
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
                let userListCountPromise = customers_repo_1.default.getCompanyUsersListCount(sqlQueryBuilder, sqlQueryBuilderList, { sortObject });
                let userListPromise = customers_repo_1.default.getCompanyUsersList(sqlQueryBuilder, sqlQueryBuilderList, {
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
                    };
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
                })
                    .catch((e) => {
                    return res.sendErrorResponse(http_status_codes_1.default.SERVICE_UNAVAILABLE, message_1.default.SOMETHING_WENT_WRONG, { errors: e.message });
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    companyUserUpdate(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany },
            validateIsCompayUserAssignToCompany: { get: () => super.validateIsCompayUserAssignToCompany },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { role }, params: { userId, companyId }, userAgent, } = req;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                yield _super.validateIsCompayUserAssignToCompany.call(this, userId, companyId);
                let user = yield users_repo_1.default.searchUser({ id: userId });
                const previousUserMetaData = yield users_repo_1.default.userMetaData(userId);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, user.role);
                delete user.id;
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.phoneNumber = null;
                user.regionId = null;
                yield users_repo_1.default.updateUser(userId, user);
                let updateData = yield users_repo_1.default.searchUser({ id: userId });
                const response = {
                    id: updateData.id,
                    firstName: updateData.firstName,
                    lastName: updateData.lastName,
                    email: updateData.email,
                    role: updateData.role,
                    phoneNumber: updateData.phoneNumber,
                    regionId: updateData.regionId,
                };
                // event log
                const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_UPDATED.id;
                const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_UPDATED.eventTypeName;
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: userId,
                    companyId,
                    companyName: companyData.companyName,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.USER_UPDATED.replace("%loginUserName%", fullName).replace("%user2%", updateData.firstName + " " + updateData.lastName),
                };
                addEventData.changes = {
                    meta: {
                        label: "User Updated",
                        previous_value_updated_user_id: previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
                        previous_value_updated_by: previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
                        previous_value_updated_on: previousUserMetaData.userUpdatedAt || previousUserMetaData.userCreatedAt,
                        current_value_updated_user_id: consumeUserId,
                        current_value_updated_by: consumeUserFullName,
                        current_value_updated_on: previousUserMetaData.userUpdatedAt || previousUserMetaData.userCreatedAt,
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
                    ],
                };
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.USER_DATA_UPDATED_SUCCESSFULLY, response);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    companyUserStatus(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsCompayUserAssignToCompany: { get: () => super.validateIsCompayUserAssignToCompany },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // access this api: superadmin and admin
                // change user status of superadmin, admin and team member
                // status should be 1 or 2
                const { userAgent, user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { status }, params: { userId, companyId }, } = req;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                const condition = { id: userId };
                logs_1.default.info([condition, "patchUserStatus"]);
                const userFind = yield users_repo_1.default.searchUser(condition);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, userFind.role);
                yield _super.validateIsCompayUserAssignToCompany.call(this, userId, companyId);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                let updateUserCondition = { status };
                delete userFind.id;
                if (userFind.status !== status) {
                    yield users_repo_1.default.updateUser(userId, updateUserCondition);
                    // event log
                    let eventLogInt = 10001;
                    let eventTypeLog = "10001";
                    let eventTypeLabel = "1001";
                    switch (status) {
                        case constants_1.ENUM_User_Status.ACTIVE:
                            eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_ACTIVATED.id;
                            eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_ACTIVATED.eventTypeName;
                            eventTypeLog = customEventMessage_1.default.USER_ACTIVE;
                            break;
                        case constants_1.ENUM_User_Status.INACTIVE:
                            eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_DEACTIVATED.id;
                            eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_DEACTIVATED.eventTypeName;
                            eventTypeLog = customEventMessage_1.default.USER_DEACTIVE;
                            break;
                    }
                    const fullName = consumeUserFullName;
                    const addEventData = {
                        alterRecordUserId: userId,
                        companyId,
                        companyName: companyData.companyName,
                        userId: consumeUserId,
                        userRoleId: consumeUserRole,
                        alterRecordUserRoleId: constants_1.ENUM_User_ROLE.CUSTOMER_USER,
                        userName: fullName,
                        eventTypeId: eventLogInt,
                        eventTypeLabel,
                        userAgent,
                        eventMessage: eventTypeLog
                            .replace("%loginUserName%", fullName)
                            .replace("%user2%", userFind.fullName),
                    };
                    customEventType_1.default.emit("add-event", addEventData);
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.STATUS_CHANGED_SUCCESSFULLY);
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.STATUS_ALREADY_SAME);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    pathCompanyUserSetTemporaryPassword(req, res) {
        const _super = Object.create(null, {
            validateIsCompayUserAssignToCompany: { get: () => super.validateIsCompayUserAssignToCompany },
            validateCompanyId: { get: () => super.validateCompanyId },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            createSalt: { get: () => super.createSalt },
            createHash: { get: () => super.createHash }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { setTemporaryPassword }, params: { userId, companyId }, userAgent, } = req;
                yield _super.validateIsCompayUserAssignToCompany.call(this, userId, companyId);
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                const websiteLink = app_1.default.web.LINK;
                const condition = { id: userId };
                logs_1.default.info([condition, "patchSetPassword"]);
                const userFind = yield users_repo_1.default.searchUser(condition);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, userFind.role);
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
                        companyId: companyId,
                        companyName: companyData.companyName,
                        eventMessage: customEventMessage_1.default.RESET_PASSWORD_OTHER.replace("%loginUserName%", consumeUserFullName).replace("%user2%", userFind.fullName),
                    };
                    customEventType_1.default.emit("add-event", addEventData);
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.SET_TEMPORARY_PASSWORD);
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.SERVICE_UNAVAILABLE, message_1.default.SOMETHING_WENT_WRONG);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    onSiteSystemData(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, body: { link }, params: { companyId }, } = req;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, companyData.userRole);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                let updateUserCondition = { onSiteSystemData: link };
                yield customers_repo_1.default.updateOnSiteSystemData(companyId, updateUserCondition, consumeUserId);
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LINK_UPDATED_SUCCESSFULLY);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    addDocument(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { documentKeyName, documentType, documentName, documentFormat, documentsizeInByte }, params: { companyId }, userAgent, } = req;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, companyData.userRole);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                // const companyStatus: number = await customerRepo.getCompanyStatus(companyId);
                if (companyData.userStatus === constants_1.ENUM_User_Status.INACTIVE) {
                    return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                }
                const findPrefixKeyName = companyData.preS3KeyName + "/" + constants_1.ENUM_PREFIX_FILE_PATH.DOC + "/";
                const isFind = documentKeyName.includes(findPrefixKeyName);
                if (!isFind) {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.DOCUMENTKEYNAME_INVALID);
                }
                let documentKeyName_ = documentKeyName.replace(findPrefixKeyName, "");
                const addDocumentData = {
                    documentKeyName: documentKeyName_,
                    documentType,
                    documentName,
                    documentFormat,
                    documentsizeInByte,
                };
                let documentId;
                try {
                    documentId = (yield customers_repo_1.default.createDocument(companyId, addDocumentData, consumeUserId));
                }
                catch (error) {
                    let message = error.sqlMgs;
                    if (error.errNo === 1062) {
                        if (message.includes("documents.documents_documentname_unique")) {
                            message = message_1.default.DOCUMENT_NAME_ALREADY_EXIST;
                        }
                    }
                    return res.sendErrorResponse(http_status_codes_1.default.CONFLICT, message, {
                        error: error.sqlMgs,
                        error1: error,
                    });
                }
                // event log
                const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.DOCUMENT_UPLOADED.id;
                const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.DOCUMENT_UPLOADED.eventTypeName;
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: companyData.userId,
                    companyId,
                    companyName: companyData.companyName,
                    documentId,
                    documentName: documentName,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: companyData.userRole,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.DOCUMENT_UPLOADED.replace("%loginUserName%", fullName).replace("%documentName%", documentName),
                };
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.CREATED, message_1.default.DOCUMENT_CREATED, {
                    id: documentId,
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    updateDocument(req, res) {
        const _super = Object.create(null, {
            validateDocumentAndCompanyId: { get: () => super.validateDocumentAndCompanyId },
            validateDocumentAsEditorPermission: { get: () => super.validateDocumentAsEditorPermission },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { documentType, documentName }, params: { companyId, documentId }, userAgent, } = req;
                const documentAndCompanyData = yield _super.validateDocumentAndCompanyId.call(this, documentId, companyId);
                // US 7.9
                if (documentAndCompanyData.companyStatus === constants_1.ENUM_User_Status.INACTIVE) {
                    throw new forbiddenError_1.default(message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                }
                //US 13.2
                yield _super.validateDocumentAsEditorPermission.call(this, consumeUserRole, documentAndCompanyData);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                const documentMetaData = yield documents_repo_1.default.documentMetaData(documentId);
                const documentTypeDetail = (yield documenttypes_repo_1.default.getDocumentTypeDetail(documentType));
                const updateDocumentData = {
                    documentType,
                    documentName,
                };
                try {
                    yield customers_repo_1.default.updateDocument(documentId, updateDocumentData, consumeUserId);
                }
                catch (error) {
                    let message = error.sqlMgs;
                    if (error.errNo === 1062) {
                        if (message.includes("documents.documents_documentname_unique")) {
                            message = "Document Name already exist.";
                        }
                    }
                    return res.status(http_status_codes_1.default.CONFLICT).send({
                        status_code: http_status_codes_1.default.CONFLICT,
                        message: message,
                        error: error.sqlMgs,
                        error1: error,
                    });
                }
                const updatedDocumentMetaData = yield documents_repo_1.default.documentMetaData(documentId);
                // event log
                const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.DOCUMENT_INFO_UPDATED.id;
                const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.DOCUMENT_INFO_UPDATED.eventTypeName;
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: documentAndCompanyData.userId,
                    companyId,
                    companyName: documentAndCompanyData.companyName,
                    documentId,
                    documentName: documentName,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: documentAndCompanyData.userRole,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.DOCUMENT_INFO_UPDATED.replace("%loginUserName%", fullName).replace("%documentName%", documentName),
                };
                addEventData.changes = {
                    meta: {
                        label: "Doc Info",
                        documentId: documentId,
                        companyId: companyId,
                        previous_value_updated_user_id: documentMetaData.updatedUserId || documentMetaData.createdUserId,
                        previous_value_updated_by: documentMetaData.updatedFullName || documentMetaData.createdFullName,
                        previous_value_updated_on: documentMetaData.documentUpdatedAt || documentMetaData.documentCreatedAt,
                        current_value_updated_user_id: updatedDocumentMetaData.updatedUserId || updatedDocumentMetaData.createdUserId,
                        current_value_updated_by: updatedDocumentMetaData.updatedFullName || updatedDocumentMetaData.createdFullName,
                        current_value_updated_on: updatedDocumentMetaData.documentUpdatedAt || updatedDocumentMetaData.documentCreatedAt,
                    },
                    event_changes: [
                        {
                            label: "File Name",
                            previous_value: documentAndCompanyData.documentName,
                            current_value: updateDocumentData.documentName,
                        },
                        {
                            label: "File Type",
                            previous_value: documentAndCompanyData.documentTypeName,
                            current_value: documentTypeDetail.documentTypeName,
                        },
                    ],
                };
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.DOCUMENT_UPDATED_SUCCESSFULLY);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    deleteDocument(req, res) {
        const _super = Object.create(null, {
            validateDocumentAndCompanyId: { get: () => super.validateDocumentAndCompanyId },
            validateDocumentAsEditorPermission: { get: () => super.validateDocumentAsEditorPermission },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, params: { companyId, documentId }, } = req;
                const documentAndCompanyData = yield _super.validateDocumentAndCompanyId.call(this, documentId, companyId);
                // US 7.9
                if (documentAndCompanyData.companyStatus === constants_1.ENUM_User_Status.INACTIVE) {
                    throw new forbiddenError_1.default(message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                }
                //US 13.2
                yield _super.validateDocumentAsEditorPermission.call(this, consumeUserRole, documentAndCompanyData);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                try {
                    yield customers_repo_1.default.deleteDocument(documentId, consumeUserId);
                }
                catch (error) {
                    let message = error.sqlMgs;
                    return res.status(http_status_codes_1.default.CONFLICT).send({
                        status_code: http_status_codes_1.default.CONFLICT,
                        message: message,
                        error: error.sqlMgs,
                        error1: error,
                    });
                }
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.DOCUMENT_DELETED_SUCCESSFULLY);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    updateDocumentPermission(req, res) {
        const _super = Object.create(null, {
            validateDocumentAndCompanyId: { get: () => super.validateDocumentAndCompanyId },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { permissionSuperAdmin, permissionAdmin, permissionTeamMember, permissionCustomerUser, }, params: { companyId, documentId }, userAgent, } = req;
                const documentAndCompanyData = yield _super.validateDocumentAndCompanyId.call(this, documentId, companyId);
                // US 7.9
                if (documentAndCompanyData.companyStatus === constants_1.ENUM_User_Status.INACTIVE) {
                    throw new forbiddenError_1.default(message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                }
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                let updateDocPermission = {
                    permissionSuperAdmin,
                    permissionAdmin,
                    permissionTeamMember,
                    permissionCustomerUser,
                };
                switch (consumeUserRole) {
                    case constants_1.ENUM_User_ROLE.SUPERADMIN:
                        updateDocPermission = {
                            // permissionSuperAdmin:2,  // can you change, you always have write permission US 17.3
                            permissionAdmin,
                            permissionTeamMember,
                            permissionCustomerUser,
                        };
                        break;
                    case constants_1.ENUM_User_ROLE.ADMIN:
                        updateDocPermission = {
                            // permissionAdmin:2,  // can you change, you always have write permission US 17.5
                            permissionTeamMember,
                            permissionCustomerUser,
                        };
                        break;
                    case constants_1.ENUM_User_ROLE.TEAM_MEMBER:
                        updateDocPermission = {
                            // permissionTeamMember:2,  // can you change, you always have write permission US 17.7
                            permissionCustomerUser,
                        };
                        break;
                }
                const previousDocumentMetaData = yield documents_repo_1.default.documentMetaData(documentId);
                try {
                    yield customers_repo_1.default.updateDocPermission(documentId, updateDocPermission, consumeUserId);
                }
                catch (error) {
                    let message = error.sqlMgs;
                    if (error.errNo === 1062) {
                        if (message.includes("documents.documents_documentname_unique")) {
                            message = message_1.default.DOCUMENT_NAME_ALREADY_EXIST;
                        }
                    }
                    return res.status(http_status_codes_1.default.CONFLICT).send({
                        status_code: http_status_codes_1.default.CONFLICT,
                        message: message,
                        error: error.sqlMgs,
                        error1: error,
                    });
                }
                const currentDocumentMetaData = yield documents_repo_1.default.documentMetaData(documentId);
                // event log
                const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.DOCUMENT_PERMISSION_UPDATED.id;
                const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.DOCUMENT_PERMISSION_UPDATED.eventTypeName;
                const fullName = consumeUserFullName;
                const addEventData = {
                    alterRecordUserId: documentAndCompanyData.userId,
                    documentId,
                    companyId,
                    companyName: documentAndCompanyData.companyName,
                    documentName: documentAndCompanyData.documentName,
                    userId: consumeUserId,
                    userRoleId: consumeUserRole,
                    alterRecordUserRoleId: documentAndCompanyData.userRole,
                    userName: fullName,
                    eventTypeId: eventLogInt,
                    eventTypeLabel,
                    userAgent,
                    eventMessage: customEventMessage_1.default.DOCUMENT_PERMISSION_UPDATED.replace("%loginUserName%", fullName).replace("%documentName%", documentAndCompanyData.documentName),
                };
                addEventData.changes = {
                    meta: {
                        label: "Role Permissions",
                        documentId: documentId,
                        companyId: companyId,
                        previous_value_updated_user_id: previousDocumentMetaData.updatedUserId || previousDocumentMetaData.createdUserId,
                        previous_value_updated_by: previousDocumentMetaData.updatedFullName || previousDocumentMetaData.createdFullName,
                        previous_value_updated_on: previousDocumentMetaData.documentUpdatedAt ||
                            previousDocumentMetaData.documentCreatedAt,
                        current_value_updated_user_id: currentDocumentMetaData.updatedUserId || currentDocumentMetaData.createdUserId,
                        current_value_updated_by: currentDocumentMetaData.updatedFullName || currentDocumentMetaData.createdFullName,
                        current_value_updated_on: currentDocumentMetaData.documentUpdatedAt || currentDocumentMetaData.documentCreatedAt,
                    },
                    event_changes: [
                        {
                            label: "All Super Admins",
                            previous_value: constants_1.ENUM_PERMISSION[documentAndCompanyData.permissionSuperAdmin],
                            current_value: constants_1.ENUM_PERMISSION[currentDocumentMetaData.permissionSuperAdmin],
                        },
                        {
                            label: "All Admins",
                            previous_value: constants_1.ENUM_PERMISSION[documentAndCompanyData.permissionAdmin],
                            current_value: constants_1.ENUM_PERMISSION[currentDocumentMetaData.permissionAdmin],
                        },
                        {
                            label: "All Assigned Team Members",
                            previous_value: constants_1.ENUM_PERMISSION[documentAndCompanyData.permissionTeamMember],
                            current_value: constants_1.ENUM_PERMISSION[currentDocumentMetaData.permissionTeamMember],
                        },
                        {
                            label: "All Customer Users",
                            previous_value: constants_1.ENUM_PERMISSION[documentAndCompanyData.permissionCustomerUser],
                            current_value: constants_1.ENUM_PERMISSION[currentDocumentMetaData.permissionCustomerUser],
                        },
                    ],
                };
                customEventType_1.default.emit("add-event", addEventData);
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.DOCUMENT_PERMISSION_UPDATED_SUCCESSFULLY, { updateDocPermission: updateDocPermission });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    getCustomersForMoveDocument(req, res) {
        const _super = Object.create(null, {
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateDocumentAndCompanyId: { get: () => super.validateDocumentAndCompanyId },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { filter }, params: { companyId, documentId }, } = req;
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, constants_1.ENUM_User_ROLE.CUSTOMER_USER);
                const documentAndCompanyData = yield _super.validateDocumentAndCompanyId.call(this, documentId, companyId);
                // US 7.9
                if (documentAndCompanyData.companyStatus === constants_1.ENUM_User_Status.INACTIVE) {
                    throw new forbiddenError_1.default(message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                }
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                const recordPerPage = 100;
                const offset = 0;
                const sortObject = { column: "c.companyName", order: "asc" };
                const pageLimitObj = { limit: recordPerPage, offset: offset };
                const sqlQuery = [];
                const sqlQueryParams = [];
                sqlQuery.push(` u.status IN (?,?)`);
                sqlQueryParams.push(constants_1.ENUM_User_Status.ACTIVE);
                sqlQueryParams.push(constants_1.ENUM_User_Status.PENDING);
                sqlQuery.push(` cu.isCompanyOwner = ?`);
                sqlQueryParams.push(true);
                sqlQuery.push(` c.id != ?`);
                sqlQueryParams.push(companyId);
                if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
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
                if (filter) {
                    if (filter.nameOrUniqueId) {
                        sqlQuery.push(`( c.companyName like ? or  c.uniqueId like ? )`);
                        sqlQueryParams.push(`%${filter.nameOrUniqueId}%`);
                        sqlQueryParams.push(`%${filter.nameOrUniqueId}%`);
                    }
                }
                let sqlQueryBuilder = sqlQuery.join(" and ");
                let sqlQueryBuilderList = sqlQueryParams;
                let userList = yield customers_repo_1.default.getCompanyNameList(sqlQueryBuilder, sqlQueryBuilderList, {
                    sortObject,
                    pageLimit: pageLimitObj,
                });
                const data = {
                    records: userList,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    moveDocumentToTargetCompany(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateDocumentAndCompanyId: { get: () => super.validateDocumentAndCompanyId },
            validateDocumentAsEditorPermission: { get: () => super.validateDocumentAsEditorPermission },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, params: { companyId, documentId, targetCompanyId }, } = req;
                const oldCompanyData = yield _super.validateCompanyId.call(this, companyId);
                const targetCompanyData = yield _super.validateCompanyId.call(this, targetCompanyId);
                if (oldCompanyData.userStatus === constants_1.ENUM_User_Status.INACTIVE ||
                    targetCompanyData.userStatus === constants_1.ENUM_User_Status.INACTIVE) {
                    return res.status(http_status_codes_1.default.FORBIDDEN).send({
                        status_code: http_status_codes_1.default.FORBIDDEN,
                        message: message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT,
                    });
                }
                const documentAndCompanyData = yield _super.validateDocumentAndCompanyId.call(this, documentId, companyId);
                // US 7.9
                if (documentAndCompanyData.companyStatus === constants_1.ENUM_User_Status.INACTIVE) {
                    throw new forbiddenError_1.default(message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                }
                //US 13.2
                yield _super.validateDocumentAsEditorPermission.call(this, consumeUserRole, documentAndCompanyData);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                try {
                    const copyFile = oldCompanyData.preS3KeyName +
                        "/" +
                        constants_1.ENUM_PREFIX_FILE_PATH.DOC +
                        "/" +
                        documentAndCompanyData.documentKeyName;
                    const targetFile = targetCompanyData.preS3KeyName +
                        "/" +
                        constants_1.ENUM_PREFIX_FILE_PATH.DOC +
                        "/" +
                        documentAndCompanyData.documentKeyName;
                    logs_1.default.error(["copyFile", copyFile]);
                    logs_1.default.error(["targetFile", targetFile]);
                    let moveDocumentToTargeCompanyId = yield documents_repo_1.default.moveDocumentToTargeCompanyId(documentId, targetCompanyId, copyFile, targetFile, consumeUserId);
                    const data = {
                        targetCompanyId: targetCompanyId,
                    };
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.DOCUMENT_MOVE_SUCCESSFULLY, data);
                }
                catch (Error) {
                    return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send({
                        status_code: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                        message: Error.message,
                        errors: Error.message,
                    });
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    fetchCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, params: {}, query: { filter }, } = req;
                const sqlQuery = [];
                const sqlQueryParams = [];
                if (filter) {
                    if (filter.companyName) {
                        sqlQuery.push("c.companyName like ?");
                        sqlQueryParams.push(`%${filter.companyName}%`);
                    }
                }
                if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
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
                const sortObject = { column: "c.companyName", order: "asc" };
                const pageLimitObj = { limit: 100, offset: 0 };
                let sqlQueryBuilder = sqlQuery.join(" and ");
                let sqlQueryBuilderList = sqlQueryParams;
                let userList = yield customers_repo_1.default.getCustomerFetchList(sqlQueryBuilder, sqlQueryBuilderList, {
                    sortObject,
                    pageLimit: pageLimitObj,
                });
                const data = {
                    records: userList,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    createPresignedPost(req, res) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateCurrentRoleAuthorize: { get: () => super.validateCurrentRoleAuthorize },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, query: { fileExt }, params: { companyId }, } = req;
                let preS3KeyName;
                const milliseconds = new Date().getTime();
                const fileName = "doc-" + milliseconds + "." + fileExt;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                preS3KeyName = companyData.preS3KeyName;
                _super.validateCurrentRoleAuthorize.call(this, consumeUserRole, companyData.userRole);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                const keyName = `${preS3KeyName}/${constants_1.ENUM_PREFIX_FILE_PATH.DOC}/${fileName}`;
                const presignedPostObj = yield s3_service_1.createPresignedPost({
                    Bucket: app_1.default.S3.AWS_BUCKET_NAME,
                    Fields: {
                        key: keyName,
                    },
                    Expires: app_1.default.S3.S3_CREATE_PRESIGNED_POST_SECOND,
                    // 'ContentType': 'image/png',
                });
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.CREATE_PESIGNED_LINK, presignedPostObj);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    createCloudFrontPresigned(req, res, next) {
        const _super = Object.create(null, {
            validateCompanyId: { get: () => super.validateCompanyId },
            validateIsTeamMemberAssignToCompany: { get: () => super.validateIsTeamMemberAssignToCompany },
            validateDocumentAndCompanyId: { get: () => super.validateDocumentAndCompanyId },
            validateDocumentAsEditorPermission: { get: () => super.validateDocumentAsEditorPermission },
            validateIsCompayUserAssignToCompany: { get: () => super.validateIsCompayUserAssignToCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, params: { companyId, documentId }, query: { action }, } = req;
                const companyData = yield _super.validateCompanyId.call(this, companyId);
                yield _super.validateIsTeamMemberAssignToCompany.call(this, consumeUserRole, consumeUserId, companyId);
                const documentAndCompanyData = yield _super.validateDocumentAndCompanyId.call(this, documentId, companyId);
                if (action === "download") {
                    //US 13.2
                    yield _super.validateDocumentAsEditorPermission.call(this, consumeUserRole, documentAndCompanyData);
                }
                if (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER) {
                    yield _super.validateIsCompayUserAssignToCompany.call(this, consumeUserId, companyId);
                }
                const fileName = companyData.preS3KeyName +
                    "/" +
                    constants_1.ENUM_PREFIX_FILE_PATH.DOC +
                    "/" +
                    documentAndCompanyData.documentKeyName;
                const presignedPostObj = yield s3_service_1.createCloudFrontPresigned(fileName);
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.CREATE_PESIGNED_LINK, {
                    url: presignedPostObj,
                });
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    multipleDownload(req, res, next) {
        const _super = Object.create(null, {
            validateMultipleCompanyIds: { get: () => super.validateMultipleCompanyIds },
            validateIsTeamMemberAssignToMultipleCompany: { get: () => super.validateIsTeamMemberAssignToMultipleCompany },
            isCompayUserAssignToMultipleCompany: { get: () => super.isCompayUserAssignToMultipleCompany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, body: { documentIds }, query: { companyId }, } = req;
                const keysNameList = [];
                const viewKeysNameList = [];
                const _getMultipleDocumentsList = yield customers_repo_1.default.getMultipleDocuments(documentIds);
                for (let rec of _getMultipleDocumentsList) {
                    if ((consumeUserRole === constants_1.ENUM_User_ROLE.SUPERADMIN &&
                        rec.permissionSuperAdmin === constants_1.ENUM_PERMISSION.EDITOR) ||
                        (consumeUserRole === constants_1.ENUM_User_ROLE.ADMIN &&
                            rec.permissionAdmin === constants_1.ENUM_PERMISSION.EDITOR) ||
                        (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER &&
                            rec.permissionTeamMember === constants_1.ENUM_PERMISSION.EDITOR) ||
                        (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER &&
                            rec.permissionCustomerUser === constants_1.ENUM_PERMISSION.EDITOR)) {
                        const fileName = rec.preS3KeyName + "/" + constants_1.ENUM_PREFIX_FILE_PATH.DOC + "/" + rec.documentKeyName;
                        const extension = rec.documentKeyName.split(".").pop();
                        const newFileName = rec.documentName + "." + extension;
                        keysNameList.push({ key: fileName, newKeyName: newFileName });
                    }
                    else {
                        viewKeysNameList.push(rec.documentName);
                    }
                }
                if (viewKeysNameList && viewKeysNameList.length) {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, "These files are in view mode " + viewKeysNameList.join());
                }
                const companyIds = _getMultipleDocumentsList.map((rec) => {
                    return rec.companyId;
                });
                let companyUniquesIds = [...new Set(companyIds)];
                const companyDatas = yield _super.validateMultipleCompanyIds.call(this, companyUniquesIds);
                for (let companyRec of companyDatas) {
                    if (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER &&
                        companyRec.userStatus === constants_1.ENUM_User_Status.INACTIVE) {
                        return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
                    }
                }
                yield _super.validateIsTeamMemberAssignToMultipleCompany.call(this, consumeUserRole, consumeUserId, companyUniquesIds);
                if (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER) {
                    yield _super.isCompayUserAssignToMultipleCompany.call(this, consumeUserId, companyUniquesIds);
                }
                if (keysNameList && keysNameList.length) {
                    const lambdaResponse = yield lambda_1.multipleDownload(keysNameList);
                    const createdS3 = JSON.parse(lambdaResponse.Payload);
                    const presignedPostObj = yield s3_service_1.createCloudFrontPresigned(createdS3.zipFileName);
                    return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.DOWNLOAD_MULTIPLE_LINK, {
                        // url: createdS3,
                        downloadLink: presignedPostObj,
                    });
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, "Nothing to download");
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
}
exports.default = new CustomerController();
