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
const auth_helper_1 = __importDefault(require("./auth.helper"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const app_1 = __importDefault(require("../../config/app"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repo_1 = __importDefault(require("./auth.repo"));
const users_repo_1 = __importDefault(require("../users/users.repo"));
const logs_1 = __importDefault(require("../../helper/logs"));
const mail_ses_1 = require("../../helper/mail_ses");
const emailTemplates_1 = __importDefault(require("../../templates/emailTemplates"));
const constants_1 = require("../../helper/constants");
const customers_repo_1 = __importDefault(require("../customers/customers.repo"));
const message_1 = __importDefault(require("../../helper/message"));
const customEventType_1 = __importDefault(require(".././../customEvents/customEventType"));
const customEventMessage_1 = __importDefault(require("../../customEvents/customEventMessage"));
class AuthController extends auth_helper_1.default {
    login(req, res) {
        const _super = Object.create(null, {
            validateUserStatusDeactive: { get: () => super.validateUserStatusDeactive },
            hashCheck: { get: () => super.hashCheck },
            generateAuthToken: { get: () => super.generateAuthToken }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { body: { email, password }, userAgent, } = req;
                const user = (yield users_repo_1.default.findUserForLoginData(email));
                if (user) {
                    const user_id = user.id;
                    _super.validateUserStatusDeactive.call(this, user.status);
                    const checkAuth = yield _super.hashCheck.call(this, user, email, password);
                    delete user.salt;
                    delete user.hash;
                    if (checkAuth) {
                        const getCompanyUserDetailPromise = customers_repo_1.default.getCompanyUserDataFromUserId(user_id);
                        const generateTokenPromise = _super.generateAuthToken.call(this, user_id, "access");
                        const generateRefreshTokenPromise = _super.generateAuthToken.call(this, user_id, "refresh");
                        Promise.all([generateTokenPromise, generateRefreshTokenPromise])
                            .then((values) => __awaiter(this, void 0, void 0, function* () {
                            let [accessToken, refreshToken] = values;
                            yield auth_repo_1.default.insertAuthTokens(user_id, userAgent, refreshToken, app_1.default.jwt.REFRESH_EXPIRES_IN);
                            if (user.role === constants_1.ENUM_User_ROLE.CUSTOMER_USER) {
                                const companyUserDetail = yield getCompanyUserDetailPromise;
                                user.companyId = companyUserDetail.companyId;
                                user.isCompanyOwner = companyUserDetail.isCompanyOwner;
                            }
                            let user_update = yield users_repo_1.default.updateLastLoggedIn(user_id);
                            const data = { user, accessToken, refreshToken };
                            const fullName = user.fullName;
                            const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.LOGIN.id;
                            const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.LOGIN.eventTypeName;
                            // event log
                            const addEventData = {
                                alterRecordUserId: user_id,
                                userId: user_id,
                                userRoleId: user.role,
                                alterRecordUserRoleId: user.role,
                                userName: fullName,
                                eventTypeId: eventLogInt,
                                eventTypeLabel,
                                userAgent,
                                eventMessage: customEventMessage_1.default.LOGGED_IN_MESSAGE.replace("%loginUserName%", fullName),
                            };
                            customEventType_1.default.emit("add-event", addEventData);
                            return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LOGIN_SUCCESSFULLY, data);
                        }))
                            .catch((e) => {
                            return res.sendErrorResponse(http_status_codes_1.default.INTERNAL_SERVER_ERROR, e.message || message_1.default.SOMETHING_WENT_WRONG, { errors: e.message });
                        });
                    }
                    else {
                        // Invalide crediantials..
                        return res.sendErrorResponse(http_status_codes_1.default.UNAUTHORIZED, message_1.default.INVALID_CREDENTAILS);
                    }
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.UNAUTHORIZED, message_1.default.EMAIL_NOT_ASSOCIATE);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    forgotPassword(req, res) {
        const _super = Object.create(null, {
            validateUserStatusDeactive: { get: () => super.validateUserStatusDeactive },
            generateAuthToken: { get: () => super.generateAuthToken }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { body: { email }, userAgent, } = req;
                const user = yield users_repo_1.default.findEmail(email);
                if (user) {
                    const fullName = user.fullName;
                    _super.validateUserStatusDeactive.call(this, user.status);
                    const user_email = email;
                    const user_id = user.id;
                    delete user.id;
                    const token = yield _super.generateAuthToken.call(this, user_id, "reset_password");
                    user.resetPassword = 1;
                    user.verificationCode = token;
                    let user_update = yield users_repo_1.default.updateUser(user_id, user);
                    if (user_update) {
                        let reset_link = app_1.default.web.LINK + "/" + app_1.default.web.RESET_PASSWORD_LINK + "?token=" + token;
                        mail_ses_1.sendEmail([user_email], emailTemplates_1.default.forgotpassword.subject, emailTemplates_1.default.forgotpassword.returnHtml({
                            firstName: user.firstName,
                            resetLink: reset_link,
                        }));
                        // event log
                        const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.FORGOT_PASSWORD.id;
                        const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.FORGOT_PASSWORD.eventTypeName;
                        const addEventData = {
                            alterRecordUserId: user_id,
                            userId: user_id,
                            userRoleId: user.role,
                            alterRecordUserRoleId: user.role,
                            userName: fullName,
                            eventTypeId: eventLogInt,
                            eventTypeLabel,
                            userAgent,
                            eventMessage: customEventMessage_1.default.FORGOT_PASSWORD.replace("%loginUserName%", fullName),
                        };
                        customEventType_1.default.emit("add-event", addEventData);
                        return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.RESET_LINK_SEND);
                    }
                    else {
                        return res.sendErrorResponse(http_status_codes_1.default.INTERNAL_SERVER_ERROR, message_1.default.SOMETHING_WENT_WRONG);
                    }
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.NOT_FOUND, message_1.default.EMAIL_NOT_FOUND);
                }
            }
            catch (Error) {
                logs_1.default.error(["forgotPassword", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    resetPassword(req, res) {
        const _super = Object.create(null, {
            validateUserStatusDeactive: { get: () => super.validateUserStatusDeactive },
            createHash: { get: () => super.createHash }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { body: { password, token: reset_token }, userAgent, } = req;
                const JWT_Refresh_key = app_1.default.jwt.SECRET_KEY;
                let verified;
                try {
                    verified = jsonwebtoken_1.default.verify(reset_token, JWT_Refresh_key);
                }
                catch (e) {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.REQUEST_FORGOT_PASSWORD_AGAIN);
                }
                const condition = { verificationCode: reset_token, id: verified.id };
                const user = yield users_repo_1.default.searchUser(condition);
                if (user) {
                    const fullName = user.fullName;
                    _super.validateUserStatusDeactive.call(this, user.status);
                    const user_id = user.id;
                    const salt = user.salt;
                    delete user.id;
                    const user_name = user.email;
                    const hash = yield _super.createHash.call(this, salt, user_name, password);
                    user.hash = hash;
                    user.resetPassword = 0;
                    user.verificationCode = null;
                    user.setTemporaryPassword = 0;
                    let user_update = yield users_repo_1.default.updateUser(user_id, user);
                    if (user_update) {
                        // event log
                        const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.id;
                        const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.eventTypeName;
                        const addEventData = {
                            alterRecordUserId: user_id,
                            userId: user_id,
                            userRoleId: user.role,
                            alterRecordUserRoleId: user.role,
                            userName: fullName,
                            eventTypeId: eventLogInt,
                            eventTypeLabel,
                            userAgent,
                            eventMessage: customEventMessage_1.default.RESET_PASSWORD.replace("%loginUserName%", fullName),
                        };
                        customEventType_1.default.emit("add-event", addEventData);
                        return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.PASSWORD_RESET_SUCCESSFULLY);
                    }
                    else {
                        return res.sendErrorResponse(http_status_codes_1.default.INTERNAL_SERVER_ERROR, message_1.default.SOMETHING_WENT_WRONG);
                    }
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.REQUEST_FORGOT_PASSWORD_AGAIN);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    //-------------------------------------------------------------------------------
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName }, body: { refreshToken }, userAgent, } = req;
                let JWT_Refresh_key = app_1.default.jwt.REFRESH_KEY;
                const verified = jsonwebtoken_1.default.verify(refreshToken, JWT_Refresh_key);
                if (verified) {
                    if (verified.id === consumeUserId) {
                        try {
                            yield auth_repo_1.default.removeAccessTokens(consumeUserId, refreshToken);
                        }
                        catch (e) {
                            return res.status(http_status_codes_1.default.FORBIDDEN).send({
                                status_code: http_status_codes_1.default.FORBIDDEN,
                                message: e.message,
                                errors: "FORBIDDEN",
                            });
                        }
                        // event log
                        const eventLogInt = constants_1.ENUM_EVENT_TYPE_LOGS.LOGOUT.id;
                        const eventTypeLabel = constants_1.ENUM_EVENT_TYPE_LOGS.LOGOUT.eventTypeName;
                        const fullName = consumeUserFullName;
                        const addEventData = {
                            alterRecordUserId: consumeUserId,
                            userId: consumeUserId,
                            userRoleId: consumeUserRole,
                            alterRecordUserRoleId: consumeUserRole,
                            userName: fullName,
                            eventTypeLabel,
                            eventTypeId: eventLogInt,
                            userAgent,
                            eventMessage: customEventMessage_1.default.LOGGED_OUT.replace("%loginUserName%", fullName),
                        };
                        customEventType_1.default.emit("add-event", addEventData);
                        return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LOGOUT_SUCCESSFULLY);
                    }
                    else {
                        return res
                            .status(http_status_codes_1.default.FORBIDDEN)
                            .send({ status_code: http_status_codes_1.default.FORBIDDEN, message: "FORBIDDEN" });
                    }
                }
                else {
                    return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.ACCOUNT_DEACTIVE);
                }
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
    //-------------------------------------------------------------------------------
    /**
     *
     * @param req
     * @param res
     * @returns
     */
    updateRefreshToken(req, res) {
        const _super = Object.create(null, {
            generateAuthToken: { get: () => super.generateAuthToken }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { body: { refreshToken: refresh_token }, } = req;
                let JWT_Refresh_key = app_1.default.jwt.REFRESH_KEY;
                const verified = jsonwebtoken_1.default.verify(refresh_token, JWT_Refresh_key);
                // return res.status(statusCodes.OK).send(verified);
                if (verified) {
                    let data = yield users_repo_1.default.searchUser({
                        id: verified.id,
                        status: constants_1.ENUM_User_Status.ACTIVE,
                    });
                    if (data) {
                        const user_id = verified.id;
                        const generateTokenPromise = _super.generateAuthToken.call(this, user_id, "access");
                        const generateRefreshTokenPromise = _super.generateAuthToken.call(this, user_id, "refresh");
                        Promise.all([generateTokenPromise, generateRefreshTokenPromise])
                            .then((values) => __awaiter(this, void 0, void 0, function* () {
                            let [accessToken, refreshToken] = values;
                            yield auth_repo_1.default.updateAcessToken(user_id, refresh_token, refreshToken, app_1.default.jwt.REFRESH_EXPIRES_IN);
                            const data = {
                                accessToken: accessToken,
                                refreshToken,
                                user: {
                                    id: user_id,
                                },
                            };
                            return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.PROVIDE_NEW_TOKEN, data);
                        }))
                            .catch((err) => {
                            return res.sendErrorResponse(http_status_codes_1.default.SERVICE_UNAVAILABLE, message_1.default.SOMETHING_WENT_WRONG, { error: err.message });
                        });
                    }
                    else {
                        return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.ACCOUNT_DEACTIVE);
                    }
                }
                else {
                    return res.sendErrorResponse(441, message_1.default.RefreshTokenExpired);
                }
            }
            catch (Error) {
                return res.sendErrorResponse(441, Error.message || message_1.default.SOMETHING_WENT_WRONG, {
                    errors: Error.message,
                });
            }
        });
    }
}
exports.default = new AuthController();
