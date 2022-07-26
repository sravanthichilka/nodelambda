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
const Controller_1 = __importDefault(require("../Controller"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../../config/app"));
const constants_1 = require("../../helper/constants");
const nanoid_1 = require("nanoid");
const crypto = require("crypto");
class AuthHelperController extends Controller_1.default {
    createRandomNumber() {
        const id = crypto.randomBytes(4).toString("hex");
        return id;
    }
    createHash(salt, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var db_salt = salt;
            const plain = (email + " " + db_salt + " " + password).toLowerCase();
            var buffer = Buffer.from(plain);
            var hash = crypto.createHash("SHA512").update(buffer, "utf-8").digest("base64");
            return hash;
        });
    }
    createSalt() {
        return __awaiter(this, void 0, void 0, function* () {
            var salt = crypto.randomBytes(250).toString("base64");
            return salt;
        });
    }
    /**
     * Hash check
     *
     * @param user object
     * @param email string
     * @param password string
     * @returns
     */
    hashCheck(user, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var db_hash = user.hash;
            var db_salt = user.salt;
            const plain = (email + " " + db_salt + " " + password).toLowerCase();
            var buffer = Buffer.from(plain);
            var hash = crypto.createHash("SHA512").update(buffer, "utf-8").digest("base64");
            if (db_hash == hash) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    /**
     *
     * @param user_id
     * @param tokenType
     * @returns token
     */
    generateAuthToken(user_id, tokenType) {
        return __awaiter(this, void 0, void 0, function* () {
            const app_name = app_1.default.app.APP_NAME;
            let JWT_key;
            let expiresIn;
            switch (tokenType) {
                case "access":
                    JWT_key = app_1.default.jwt.SECRET_KEY;
                    expiresIn = app_1.default.jwt.TOKEN_EXPIRES_IN;
                    break;
                case "refresh":
                    JWT_key = app_1.default.jwt.REFRESH_KEY;
                    expiresIn = app_1.default.jwt.REFRESH_EXPIRES_IN;
                    break;
                case "reset_password":
                    JWT_key = app_1.default.jwt.SECRET_KEY;
                    expiresIn = app_1.default.jwt.RESET_PASSWORD_EXPIRES_IN;
                    break;
            }
            const payload = { id: user_id, name: app_name };
            const token = jsonwebtoken_1.default.sign(payload, JWT_key, {
                expiresIn: expiresIn,
            });
            return token;
        });
    }
    static createNanoid() {
        const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nanoid = nanoid_1.customAlphabet(alphabet, 8);
        return nanoid();
    }
    /**
     *
     * We compare currentRole<compareRole
     * example
     * admin has 2 current role
     *  he can not change data of 1 compare role id
     *  he can not change data of 2 compare role id
     *  he can change data of 3 compare role id
     *
     * @param currentRole
     * @param compareRole
     * @returns
     */
    isCurrentRoleAuthorize(currentRole, compareRole) {
        if (currentRole === constants_1.ENUM_User_ROLE.SUPERADMIN) {
            return true;
        }
        if (currentRole < compareRole) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.default = AuthHelperController;
