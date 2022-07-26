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
// statusCodes.LOGIN_TIME_OUT=440;
const accessVerification = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.header('authorization');
            if (!token) {
                return res.status(http_status_codes_1.default.UNPROCESSABLE_ENTITY).send({ status_code: http_status_codes_1.default.UNPROCESSABLE_ENTITY,
                    message: "authorization is required" });
            }
            var JWT_key = app_1.default.jwt.SECRET_KEY;
            const verified = jwt.verify(token, JWT_key);
            if (verified) {
                let user = yield users_repo_1.default.searchUser({ 'id': verified.id });
                // if(user.setTemporaryPassword){
                //    return  res.status(200).send({ status_code:200,
                //          "message":'set password',
                //          data:user
                //     });
                // }
                // let checkInDB:any = await authRepo.findToken(token);
                //   var condition = {'u.id': verified.id,'ut.AccessToken':token};
                //   log.info([condition,"condition"])
                //   let user:any = await authRepo.accessTokenVerification(condition);
                if (user) {
                    //   if(user.setTemporaryPassword){
                    //     return  res.status(statusCodes.FORBIDDEN).send({ status_code:statusCodes.FORBIDDEN,
                    //           "message":'You need to change your password. Please re-login'
                    //      });
                    //  }
                    if (user.status === constants_1.ENUM_User_Status.INACTIVE) {
                        return res.status(http_status_codes_1.default.FORBIDDEN).send({ status_code: http_status_codes_1.default.FORBIDDEN, message: "Your account is deactivated, please contact super admin." });
                    }
                    req.user = user;
                    next();
                }
                else {
                    return res.status(http_status_codes_1.default.UNAUTHORIZED).send({ status_code: http_status_codes_1.default.UNAUTHORIZED, "message": 'invalidAccessToken' });
                }
            }
            else {
                res.status(440).send({ status_code: 440, "message": 'accessTokenExpired' });
            }
        }
        catch (JsonWebTokenError) {
            console.log("JsonWebTokenError");
            console.log(JsonWebTokenError);
            if (JsonWebTokenError.name == "TokenExpiredError") {
                res.status(440).send({ status_code: 440, "message": 'accessTokenExpired' });
            }
            if (JsonWebTokenError.name == "JsonWebTokenError") {
                res.status(440).send({ status_code: 440, "message": 'accessTokenExpired' });
            }
            logs_1.default.error(['Middleware Jwt error..', JsonWebTokenError.name, JsonWebTokenError.message]);
        }
    });
};
exports.default = accessVerification;
