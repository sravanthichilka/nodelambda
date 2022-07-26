"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const users_controller_1 = __importDefault(require("./users.controller"));
const users_validator_1 = __importDefault(require("./users.validator"));
const express_joi_validation_1 = require("express-joi-validation");
const constants_1 = require("../../helper/constants");
const multipleAccessMiddleware_1 = __importDefault(require("../../middleware/multipleAccessMiddleware"));
const a = express_1.default.Router();
const validator = express_joi_validation_1.createValidator({
    passError: true,
});
a.get("/", multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN]), validator.query(users_validator_1.default.userList), users_controller_1.default.getUsers);
a.post("/", multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN]), validator.body(users_validator_1.default.addUser), users_controller_1.default.addUser);
a.put("/:userId", multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN]), validator.body(users_validator_1.default.updateUser), users_controller_1.default.updateUser);
a.patch("/:userId/status", multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN]), validator.body(users_validator_1.default.patchUserStatus), users_controller_1.default.patchUserStatus);
a.patch("/:userId/setTemporaryPassword", multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN]), validator.body(users_validator_1.default.patchSetPassword), users_controller_1.default.pathSetTemporaryPassword);
module.exports = a;
