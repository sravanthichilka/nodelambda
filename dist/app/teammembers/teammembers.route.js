"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const teammembers_controller_1 = __importDefault(require("./teammembers.controller"));
const teammembers_validator_1 = __importDefault(require("./teammembers.validator"));
const express_joi_validation_1 = require("express-joi-validation");
const constants_1 = require("../../helper/constants");
const multipleAccessMiddleware_1 = __importDefault(require("../../middleware/multipleAccessMiddleware"));
const a = express_1.default.Router();
const validator = express_joi_validation_1.createValidator({
    passError: true,
});
a.get("/fetch", multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN]), validator.query(teammembers_validator_1.default.teamMemberList), teammembers_controller_1.default.fetchTeamMember);
module.exports = a;
