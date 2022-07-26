"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const auth_validator_1 = __importDefault(require("./auth.validator"));
const multipleAccessMiddleware_1 = __importDefault(require("../../middleware/multipleAccessMiddleware"));
const express_joi_validation_1 = require("express-joi-validation");
const constants_1 = require("../../helper/constants");
const a = express_1.default.Router();
const validator = express_joi_validation_1.createValidator({
    passError: true,
});
a.post("/login", validator.body(auth_validator_1.default.login), auth_controller_1.default.login);
a.post("/forgotPassword", validator.body(auth_validator_1.default.forgotPassword), auth_controller_1.default.forgotPassword);
a.post("/resetPassword", validator.body(auth_validator_1.default.resetPassword), auth_controller_1.default.resetPassword);
a.post("/refreshToken", validator.body(auth_validator_1.default.refreshToken), auth_controller_1.default.updateRefreshToken);
a.post("/logout", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    constants_1.ENUM_User_ROLE.CUSTOMER_USER,
]), validator.body(auth_validator_1.default.logout), auth_controller_1.default.logout);
module.exports = a;
