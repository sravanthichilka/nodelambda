"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const eventlogs_controller_1 = __importDefault(require("./eventlogs.controller"));
const eventlogs_validator_1 = __importDefault(require("./eventlogs.validator"));
const express_joi_validation_1 = require("express-joi-validation");
const multipleAccessMiddleware_1 = __importDefault(require("../../middleware/multipleAccessMiddleware"));
const constants_1 = require("../../helper/constants");
const a = express_1.default.Router();
const validator = express_joi_validation_1.createValidator({
    passError: true
});
//sprint 3
a.get('/', multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN, constants_1.ENUM_User_ROLE.TEAM_MEMBER]), validator.query(eventlogs_validator_1.default.eventList), eventlogs_controller_1.default.fetchEventTypes);
a.get('/:id', multipleAccessMiddleware_1.default([constants_1.ENUM_User_ROLE.SUPERADMIN, constants_1.ENUM_User_ROLE.ADMIN, constants_1.ENUM_User_ROLE.TEAM_MEMBER]), eventlogs_controller_1.default.eventTypeId);
module.exports = a;
