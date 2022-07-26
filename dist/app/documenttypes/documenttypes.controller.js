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
const documenttypes_repo_1 = __importDefault(require("./documenttypes.repo"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const logs_1 = __importDefault(require("../../helper/logs"));
const constants_1 = require("../../helper/constants");
const message_1 = __importDefault(require("../../helper/message"));
class CustomerController extends auth_helper_1.default {
    fetchDocumentTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: { id: consumeUserId, role: consumeUserRole }, params: {} } = req;
                const sqlQuery = [];
                const sqlQueryParams = [];
                const sortObject = { column: "id", order: "asc" };
                const pageLimitObj = { limit: 100, offset: 0 };
                sqlQuery.push(` status=? `);
                sqlQueryParams.push(constants_1.ENUM_DOCUMENT_TYPE_STATUS.ACTIVE);
                let sqlQueryBuilder = sqlQuery.join(" and ");
                let sqlQueryBuilderList = sqlQueryParams;
                let documentTypesList = yield documenttypes_repo_1.default.getDocumentTypeFetchList(sqlQueryBuilder, sqlQueryBuilderList, { sortObject, pageLimit: pageLimitObj });
                const data = {
                    records: documentTypesList,
                };
                return res.sendSucessResponse(http_status_codes_1.default.OK, message_1.default.LIST, data);
            }
            catch (Error) {
                logs_1.default.error(['additionalInformation', Error]);
                return res.sendErrorResponse(Error.statusCode || http_status_codes_1.default.INTERNAL_SERVER_ERROR, Error.message || message_1.default.SOMETHING_WENT_WRONG, { errors: Error.message });
            }
        });
    }
}
exports.default = new CustomerController();
