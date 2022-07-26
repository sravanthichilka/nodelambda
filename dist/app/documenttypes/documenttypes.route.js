"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const documenttypes_controller_1 = __importDefault(require("./documenttypes.controller"));
const express_joi_validation_1 = require("express-joi-validation");
const multipleAccessMiddleware_1 = __importDefault(require("../../middleware/multipleAccessMiddleware"));
const constants_1 = require("../../helper/constants");
const a = express_1.default.Router();
const validator = express_joi_validation_1.createValidator({
    passError: true
});
//sprint 3
a.get('/fetch', multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN, constants_1.ENUM_User_ROLE.TEAM_MEMBER, constants_1.ENUM_User_ROLE.CUSTOMER_USER]), documenttypes_controller_1.default.fetchDocumentTypes);
module.exports = a;
