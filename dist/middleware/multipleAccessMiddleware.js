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
const jwt = __importStar(require("jsonwebtoken"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const app_1 = __importDefault(require("../config/app"));
const logs_1 = __importDefault(require("../helper/logs"));
const users_repo_1 = __importDefault(require("../app/users/users.repo"));
const constants_1 = require("../helper/constants");
const message_1 = __importDefault(require("../helper/message"));
/**
 *
  1. Check JWT signature verification - valid or not
  2. If JWT verified, then check roles can access the api.
  3. Then check users Status (active) can allow.
  4. If all conditions are meet. Pass user object for next middleware.
 *
 * @param allowRoles array [1,2,3]
 * @param allowStatus array [1]
 * @returns
 */
const isAccessTokenValidMiddleware = function (allowRoles, allowStatus = [constants_1.ENUM_User_Status.ACTIVE]) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.header('authorization');
                if (!token) {
                    return res.sendErrorResponse(http_status_codes_1.default.UNPROCESSABLE_ENTITY, message_1.default.AUTHORIZATION_REQUIRED);
                }
                const JWT_key = app_1.default.jwt.SECRET_KEY;
                const verified = jwt.verify(token, JWT_key);
                if (verified) {
                    const user = yield users_repo_1.default.searchUser({ 'id': verified.id });
                    if (user) {
                        if (!(allowRoles.includes(user.role))) {
                            return res.sendErrorResponse(http_status_codes_1.default.FORBIDDEN, message_1.default.FORBIDDEN);
                            // return res.status(statusCodes.FORBIDDEN).send({ status_code: statusCodes.FORBIDDEN, message: MESSAGE_ENUM.FORBIDDEN });
                        }
                        if (!(allowStatus.includes(user.status))) {
                            return res.sendErrorResponse(451, message_1.default.ACCOUNT_PENDING_DEACTIVE, { redirectToLogin: true });
                        }
                        req.user = user;
                        next();
                    }
                    else {
                        return res.sendErrorResponse(http_status_codes_1.default.UNAUTHORIZED, message_1.default.INVALID_ACCESS_TOKEN);
                    }
                }
                else {
                    return res.sendErrorResponse(440, message_1.default.ACCESS_TOKEN_EXPIRED);
                }
            }
            catch (JsonWebTokenError) {
                logs_1.default.error(['Middleware Jwt error..', JsonWebTokenError.name, JsonWebTokenError.message]);
                if (JsonWebTokenError.name == "TokenExpiredError") {
                    return res.sendErrorResponse(440, message_1.default.ACCESS_TOKEN_EXPIRED);
                }
                if (JsonWebTokenError.name == "JsonWebTokenError") {
                    return res.sendErrorResponse(440, message_1.default.ACCESS_TOKEN_EXPIRED);
                }
            }
        });
    };
};
exports.default = isAccessTokenValidMiddleware;
