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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const logs_1 = __importDefault(require("../../helper/logs"));
const message_1 = __importDefault(require("../../helper/message"));
const constants_1 = require("../../helper/constants");
const constants_2 = require("../../helper/constants");
class CustomerController extends auth_helper_1.default {
    fetchEventTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, params: {}, query: { showCustomerEventLogList }, } = req;
                let documentTypesList = Object.values(constants_2.ENUM_EVENT_TYPE_LOGS);
                let adminDisAllow = [
                    constants_2.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_CREATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_UPDATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_ACTIVATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_DEACTIVATED.id,
                ];
                let teamMemberDisAllow = [
                    ...adminDisAllow,
                    constants_2.ENUM_EVENT_TYPE_LOGS.ADMIN_CREATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.ADMIN_UPDATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.ADMIN_ACTIVATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.ADMIN_DEACTIVATED.id,
                ];
                let customerUserDisAllow = [
                    ...teamMemberDisAllow,
                    constants_2.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_CREATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_UPDATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_ACTIVATED.id,
                    constants_2.ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_DEACTIVATED.id,
                ];
                if (consumeUserRole === constants_1.ENUM_User_ROLE.ADMIN) {
                    documentTypesList = Object.values(constants_2.ENUM_EVENT_TYPE_LOGS).filter((rec) => !adminDisAllow.includes(rec.id));
                }
                else if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                    documentTypesList = Object.values(constants_2.ENUM_EVENT_TYPE_LOGS).filter((rec) => !teamMemberDisAllow.includes(rec.id));
                }
                else if (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER) {
                    documentTypesList = Object.values(constants_2.ENUM_EVENT_TYPE_LOGS).filter((rec) => !customerUserDisAllow.includes(rec.id));
                }
                if (showCustomerEventLogList) {
                    documentTypesList = Object.values(constants_2.ENUM_EVENT_TYPE_LOGS).filter((rec) => !customerUserDisAllow.includes(rec.id));
                }
                const data = {
                    records: documentTypesList,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(["additionalInformation", Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
}
exports.default = new CustomerController();
