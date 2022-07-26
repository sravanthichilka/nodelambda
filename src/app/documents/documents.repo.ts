import knex from "knex";
import UnProcessableError from "../../helper/error/unProcessableError";
const connection = require("../../config/database").Knex.config;
const db = knex(connection);
import log from "../../helper/logs";
import { moveAndDeleteFile as _moveAndDeleteS3File } from "../../helper/s3-service";
import { documentMetaDataInterface } from "./document.interface";
import MESSAGE_ENUM from "../../helper/message";

class DocumentRepo {
  getDocumentList(sql: any, sqlP: any, data: any) {
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

        .select(
          "company_owner_user.id As companyOwnerUserId",
          "uploadedUser.id As uploadedUserId",
          db.raw(`CONCAT_WS(" ", uploadedUser.firstName, uploadedUser.lastName) AS uploadedBy`),
          " d.id AS documentId",
          "d.companyId",
          "d.documentFormat",
          " d.documentsizeInByte",
          "d.permissionSuperAdmin",
          "d.permissionAdmin",
          " d.permissionTeamMember",
          "d.permissionCustomerUser",
          "d.documentName",
          "d.documentType",
          "dt.documentTypeName",
          "c.companyName",
          "c.onSiteSystemData",
          "d.createdAt AS documentCreatedAt",
          "company_owner_user.status AS companyOwnerUserStatus"
        )
        .where({ "d.isDeleted": false })
        .where(db.raw(sql, sqlP))
        .orderBy(data.sortObject.column, data.sortObject.order)
        .limit(data.pageLimit.limit)
        .offset(data.pageLimit.offset)

        .then(function (data: any) {
          resolve(data);
        })
        .catch(function (error: any) {
          log.info(["getDocumentList", error.message]);
          resolve([]);
        });
    });
  }

  getDocumentListCount(sql: any, sqlP: any, data: any): Promise<number> {
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
        .then(function (data: any) {
          resolve(data[0].count);
        })
        .catch(function (error: any) {
          log.info(["getDocumentListCount", error.message]);
          resolve(0);
        });
    });
  }

  moveDocumentToTargeCompanyId(
    documentId: number,
    targetCompanyId: number,
    copyFile: string,
    targetFile: string,
    updatedBy: number
  ): any {
    return new Promise(async (resolve, reject) => {
      try {
        await db.transaction(async (trx) => {
          const companyData = await trx("documents")
            .where({ id: documentId })
            .update({ companyId: targetCompanyId, updatedBy: updatedBy });
          if (companyData) {
            try {
              await _moveAndDeleteS3File(copyFile, targetFile);
              return resolve(companyData);
            } catch (s3error) {
              log.info(["moveDocumentToTargeCompanyId:s3error", s3error]);
              return reject(new Error(MESSAGE_ENUM.UNABLE_TO_DELETE_DOCUMENT));
            }
          } else {
            return reject(new Error(MESSAGE_ENUM.DOCUMENT_NOT_UPDATED));
          }
        });
      } catch (error: any) {
        log.info(["trx update moveDocumentToTargeCompanyId - error - ", error.message]);
        return reject({
          error,
          errNo: error.errno,
          errMgs: error.message,
          message: error.message,
          sqlMgs: error.sqlMessage,
        });
      }
    });
  }

  documentMetaData(documentId: number): Promise<documentMetaDataInterface> {
    return new Promise(function (resolve, reject) {
      let user = db("documents AS d")
        .join("users AS cby", "cby.id", "d.createdBy")
        .leftJoin("users AS uby", "uby.id", "d.updatedBy")
        .select(
          "d.id As documentId",
          "d.createdAt As documentCreatedAt",
          "d.updatedAt As documentUpdatedAt",
          "cby.id As createdUserId",
          db.raw(`CONCAT_WS(" ", cby.firstName, cby.lastName) AS createdFullName`),
          "uby.id As updatedUserId",
          db.raw(`CONCAT_WS(" ", uby.firstName, uby.lastName) AS updatedFullName`),
          "d.permissionSuperAdmin",
          "d.permissionAdmin",
          "d.permissionTeamMember",
          "d.permissionCustomerUser"
        )
        .first()
        .where({ "d.id": documentId })
        .then(function (data: any) {
          resolve(data);
        })
        .catch(function (error: any) {
          log.info(["getDocumentList", error.message]);
          reject(new UnProcessableError("document not found"));
        });
    });
  }
}
export default new DocumentRepo();
