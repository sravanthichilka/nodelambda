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
const knex_1 = __importDefault(require("knex"));
const connection = require("../../config/database").Knex.config;
const db = knex_1.default(connection);
const logs_1 = __importDefault(require("../../helper/logs"));
class AuthRepo {
    insertAuthTokens(user_id, userAgent, refresh, expireTokenInSecond = 216000) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const data = yield trx("user_tokens").insert({
                        userId: user_id,
                        userAgent: userAgent,
                        refreshToken: refresh,
                        issueAt: db.raw("NOW()"),
                        expireAt: db.raw(`DATE_ADD(NOW(), INTERVAL ${expireTokenInSecond} second)`),
                    });
                    return resolve(data[0]);
                }));
            }
            catch (error) {
                logs_1.default.info(["trx insertAuthTokens - error - ", error.message]);
                return reject(error);
            }
        }));
    }
    updateAcessToken(userId, oldRefreshToken, refreshToken, expireTokenInSecond = 216000) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const data = yield trx("user_tokens")
                        .where({ userId: userId, refreshToken: oldRefreshToken })
                        .update({
                        refreshToken: refreshToken,
                        issueAt: db.raw("NOW()"),
                        expireAt: db.raw(`DATE_ADD(NOW(), INTERVAL ${expireTokenInSecond} second)`),
                    });
                    return resolve(data);
                }));
            }
            catch (error) {
                logs_1.default.info(["trx updateAcessToken - error - ", error.message]);
                return reject(error);
            }
        }));
    }
    accessTokenVerification(condition) {
        return new Promise(function (resolve) {
            db("Users as u")
                .join("UserTokens as ut", "ut.UserID", "u.UserID")
                .join("UsersRoles as ur", "ur.UserID", "u.UserID")
                .leftJoin("Drivers as d", "d.UserID", "u.UserID")
                .where(condition)
                .select("u.*", "d.ShippingAddressID", "ur.RoleID", db.raw("isnull(d.DriverType,'') as UserSubType"))
                .first()
                .catch(function (error) {
                logs_1.default.info(["tokenVerified - error - ", error.message]);
                resolve(null);
            })
                .then(function (data) {
                resolve(data);
            });
        });
    }
    removeAccessTokens(userId, refreshToken) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const data = yield trx("user_tokens").where({ userId, refreshToken }).del();
                    return resolve(data);
                }));
            }
            catch (error) {
                logs_1.default.info(["trx removeAccessTokens - error - ", error.message]);
                return reject(new Error("Token not found"));
            }
        }));
    }
}
exports.default = new AuthRepo();
