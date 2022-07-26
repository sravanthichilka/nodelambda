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
const knex_1 = __importDefault(require("knex"));
const unProcessableError_1 = __importDefault(require("../../helper/error/unProcessableError"));
const connection = require("../../config/database").Knex.config;
const db = knex_1.default(connection);
const logs_1 = __importDefault(require("../../helper/logs"));
const s3_service_1 = require("../../helper/s3-service");
const message_1 = __importDefault(require("../../helper/message"));
class DocumentRepo {
    getDocumentList(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("documents AS d")
                .join("document_types AS dt", "dt.id", "d.documentType")
                .join("users AS uploadedUser", "uploadedUser.id", "d.createdBy")
                .join("companies AS c", "c.id", "d.companyId")
                .join("company_users AS cu", {
                "cu.companyId": "c.id",
                "cu.isCompanyOwner": db.raw("?", [true]),
            })
                .join("users AS company_owner_user", "cu.userId", "company_owner_user.id")
                .select("company_owner_user.id As companyOwnerUserId", "uploadedUser.id As uploadedUserId", db.raw(`CONCAT_WS(" ", uploadedUser.firstName, uploadedUser.lastName) AS uploadedBy`), " d.id AS documentId", "d.companyId", "d.documentFormat", " d.documentsizeInByte", "d.permissionSuperAdmin", "d.permissionAdmin", " d.permissionTeamMember", "d.permissionCustomerUser", "d.documentName", "d.documentType", "dt.documentTypeName", "c.companyName", "c.onSiteSystemData", "d.createdAt AS documentCreatedAt", "company_owner_user.status AS companyOwnerUserStatus")
                .where({ "d.isDeleted": false })
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .offset(data.pageLimit.offset)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getDocumentList", error.message]);
                resolve([]);
            });
        });
    }
    getDocumentListCount(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("documents AS d")
                .join("document_types AS dt", "dt.id", "d.documentType")
                .join("users AS uploadedUser", "uploadedUser.id", "d.createdBy")
                .join("companies AS c", "c.id", "d.companyId")
                .join("company_users AS cu", {
                "cu.companyId": "c.id",
                "cu.isCompanyOwner": db.raw("?", [true]),
            })
                .join("users AS company_owner_user", "cu.userId", "company_owner_user.id")
                .where({ isDeleted: false })
                .where(db.raw(sql, sqlP));
            user
                .countDistinct("d.id as count")
                .orderBy(data.sortObject.column, data.sortObject.order)
                .then(function (data) {
                resolve(data[0].count);
            })
                .catch(function (error) {
                logs_1.default.info(["getDocumentListCount", error.message]);
                resolve(0);
            });
        });
    }
    moveDocumentToTargeCompanyId(documentId, targetCompanyId, copyFile, targetFile, updatedBy) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const companyData = yield trx("documents")
                        .where({ id: documentId })
                        .update({ companyId: targetCompanyId, updatedBy: updatedBy });
                    if (companyData) {
                        try {
                            yield s3_service_1.moveAndDeleteFile(copyFile, targetFile);
                            return resolve(companyData);
                        }
                        catch (s3error) {
                            logs_1.default.info(["moveDocumentToTargeCompanyId:s3error", s3error]);
                            return reject(new Error(message_1.default.UNABLE_TO_DELETE_DOCUMENT));
                        }
                    }
                    else {
                        return reject(new Error(message_1.default.DOCUMENT_NOT_UPDATED));
                    }
                }));
            }
            catch (error) {
                logs_1.default.info(["trx update moveDocumentToTargeCompanyId - error - ", error.message]);
                return reject({
                    error,
                    errNo: error.errno,
                    errMgs: error.message,
                    message: error.message,
                    sqlMgs: error.sqlMessage,
                });
            }
        }));
    }
    documentMetaData(documentId) {
        return new Promise(function (resolve, reject) {
            let user = db("documents AS d")
                .join("users AS cby", "cby.id", "d.createdBy")
                .leftJoin("users AS uby", "uby.id", "d.updatedBy")
                .select("d.id As documentId", "d.createdAt As documentCreatedAt", "d.updatedAt As documentUpdatedAt", "cby.id As createdUserId", db.raw(`CONCAT_WS(" ", cby.firstName, cby.lastName) AS createdFullName`), "uby.id As updatedUserId", db.raw(`CONCAT_WS(" ", uby.firstName, uby.lastName) AS updatedFullName`), "d.permissionSuperAdmin", "d.permissionAdmin", "d.permissionTeamMember", "d.permissionCustomerUser")
                .first()
                .where({ "d.id": documentId })
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getDocumentList", error.message]);
                reject(new unProcessableError_1.default("document not found"));
            });
        });
    }
}
exports.default = new DocumentRepo();
