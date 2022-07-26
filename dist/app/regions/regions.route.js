"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const regions_controller_1 = __importDefault(require("./regions.controller"));
const multipleAccessMiddleware_1 = __importDefault(require("../../middleware/multipleAccessMiddleware"));
const constants_1 = require("../../helper/constants");
const a = express_1.default.Router();
//sprint 3
a.get("/fetch", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    constants_1.ENUM_User_ROLE.CUSTOMER_USER,
]), regions_controller_1.default.fetchRegionTypes);
module.exports = a;
