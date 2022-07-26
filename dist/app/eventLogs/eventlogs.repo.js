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
const logsModal_1 = __importDefault(require("../../mongo_model/logsModal"));
class UserRepo {
    getDocumentTypeFetchList(conditionObject, sortObject, currentPage, recordPerPage) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = recordPerPage * currentPage - recordPerPage;
            const limit = recordPerPage;
            const recordDetail = yield logsModal_1.default.aggregate([
                { $match: conditionObject },
                { $sort: sortObject },
                {
                    $facet: {
                        totalRecordCount: [{ $count: "count" }],
                        records: [
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    userId: 1,
                                    userName: 1,
                                    eventMessage: 1,
                                    eventTypeId: 1,
                                    eventTypeLabel: 1,
                                    userAgent: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                    changes: 1,
                                    userRoleId: 1,
                                    alterRecordUserRoleId: 1,
                                    companyId: 1,
                                    companyName: 1,
                                    documentId: 1,
                                    documentName: 1,
                                },
                            },
                        ],
                    },
                },
            ]);
            return {
                totalRecord: recordDetail[0]["records"],
                totalRecordCount: recordDetail[0]["totalRecordCount"][0] && recordDetail[0]["totalRecordCount"][0]["count"]
                    ? recordDetail[0]["totalRecordCount"][0]["count"]
                    : 0,
            };
        });
    }
    getDocumentTypeFetchCount(conditionObject, sortObject) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield logsModal_1.default.countDocuments(conditionObject).sort(sortObject);
        });
    }
    getEventLogDetail(eventTypeLogId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield logsModal_1.default.findById(eventTypeLogId).populate("changes");
        });
    }
}
exports.default = new UserRepo();
