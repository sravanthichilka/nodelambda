"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./user.controller"));
const user_validator_1 = __importDefault(require("./user.validator"));
const express_joi_validation_1 = require("express-joi-validation");
const multipleAccessMiddleware_1 = __importDefault(require("../../../middleware/multipleAccessMiddleware"));
const constants_1 = require("../../../helper/constants");
const a = express_1.default.Router();
const validator = express_joi_validation_1.createValidator({
    passError: true
});
a.put('/profile', multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN, constants_1.ENUM_User_ROLE.TEAM_MEMBER, constants_1.ENUM_User_ROLE.CUSTOMER_USER]), validator.body(user_validator_1.default.viewProfile), user_controller_1.default.userProfile);
a.get('/me', multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN, constants_1.ENUM_User_ROLE.TEAM_MEMBER, constants_1.ENUM_User_ROLE.CUSTOMER_USER]), validator.query(user_validator_1.default.getMe), user_controller_1.default.userMe);
a.patch('/setPassword', multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN, constants_1.ENUM_User_ROLE.TEAM_MEMBER, constants_1.ENUM_User_ROLE.CUSTOMER_USER], [constants_1.ENUM_User_Status.ACTIVE, constants_1.ENUM_User_Status.PENDING]), validator.body(user_validator_1.default.setPassword), user_controller_1.default.setPassword);
a.get('/myEventLog', multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN, constants_1.ENUM_User_ROLE.TEAM_MEMBER, constants_1.ENUM_User_ROLE.CUSTOMER_USER]), validator.query(user_validator_1.default.myEventList), user_controller_1.default.myEventLog);
module.exports = a;
