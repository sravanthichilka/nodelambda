import { NextFunction, Request, Response } from "express";
import statusCodes from "http-status-codes";
import customerRepo from "../customers/customers.repo";
import documentRepo from "./documents.repo";
import HelperController from "../auth/auth.helper";
import log from "../../helper/logs";
import { ENUM_User_ROLE } from "../../helper/constants";
import MESSAGE_ENUM from "../../helper/message";
import { companyDataModel } from "../customers/customer.interface";


class UserController extends HelperController {
  async getDocuments(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { filter, sortBy, currentPage, recordPerPage },
        params: {},
      } = req;

      let {
        query: { companyId },
      } = req;

      let onSiteSystemData: string | undefined;
      const sqlQuery = [];
      const sqlQueryParams = [];

      if (companyId) {
        const companyData: companyDataModel = await super.validateCompanyId(companyId);
        onSiteSystemData = companyData.onSiteSystemData;

        //  customer login and view document api.
        // const isAuthorizeByRole: boolean = super.isCurrentRoleAuthorize(consumeUserRole, companyData.userRole);
        // if (!isAuthorizeByRole) {
        //     return res.status(statusCodes.FORBIDDEN).send({ status_code: statusCodes.FORBIDDEN, message: "You are not authorized to update anything on this user." });
        // }
      }

      if (consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER) {
        const customerUserData: any = await customerRepo.getCompanyUserDataFromUserId(
          consumeUserId
        );
        companyId = customerUserData.companyId;

        sqlQuery.push(` c.id = ?`);
        sqlQueryParams.push(companyId);
      } else if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        if (companyId) {
          await super.validateIsTeamMemberAssignToCompany(
            consumeUserRole,
            consumeUserId,
            companyId
          );

          sqlQuery.push(` c.id = ?`);
          sqlQueryParams.push(companyId);
        } else {
          const teamMemberData: any = await customerRepo.getCompanyListFromTeammember(
            consumeUserId
          );

          const tmIds: number[] = [];
          const tmComma: string[] = [];

          if (teamMemberData && teamMemberData.length) {
            teamMemberData.map((rec: any) => {
              tmComma.push("?");
              tmIds.push(rec.companyId);
            });
          } else {
            tmComma.push("?");
            tmIds.push(-1);
          }

          if (tmIds && tmIds.length) {
            sqlQuery.push(` c.id IN (${tmComma.join()})`);
            sqlQueryParams.push(...tmIds);
          }
        }
      } else {
        if (companyId) {
          sqlQuery.push(` c.id = ?`);
          sqlQueryParams.push(companyId);
        }
      }

      const sortObject: any = { column: "d.id", order: "desc" };
      const pageLimitObj = {
        limit: recordPerPage,
        offset: recordPerPage * currentPage - recordPerPage,
      };

      if (filter) {
        if (filter.companyName) {
          sqlQuery.push(`c.companyName like ? `);
          sqlQueryParams.push(`%${filter.companyName}%`);
        }

        if (filter.documentName) {
          sqlQuery.push(`d.documentName like ? `);
          sqlQueryParams.push(`%${filter.documentName}%`);
        }
        if (filter.documentType) {
          sqlQuery.push(` d.documentType = ?`);
          sqlQueryParams.push(filter.documentType);
        }
      }

      if (sortBy) {
        for (let sortByKey in sortBy) {
          if (["documentName", "documentTypeName"].includes(sortByKey)) {
            sortObject.column = sortByKey;

            if (sortByKey === "documentTypeName") {
              sortObject.column = "dt.documentTypeName";
            }

            sortObject.order = sortBy[sortByKey];
          }
        }
      }

      let sqlQueryBuilder = sqlQuery.join(" and ");
      let sqlQueryBuilderList = sqlQueryParams;

      let userListCountPromise = documentRepo.getDocumentListCount(
        sqlQueryBuilder,
        sqlQueryBuilderList,
        { sortObject }
      );
      let userListPromise = documentRepo.getDocumentList(sqlQueryBuilder, sqlQueryBuilderList, {
        sortObject,
        pageLimit: pageLimitObj,
      });

      Promise.all([userListCountPromise, userListPromise])
        .then((values: [any, any]) => {
          let [userListCount, userList] = values;

          const totalPages = Math.ceil(userListCount / recordPerPage);
          const data = {
            records: userList,
            recordsMetaData: {
              recordPerPage,
              currentPage,
              totalPages,
              totalRecords: userListCount,
            },
            onSiteSystemData: onSiteSystemData,
          };

          return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, data);
        })
        .catch((e: any) => {
          log.error(["getCustomers: catch::", e]);
          return res.sendErrorResponse(
            statusCodes.SERVICE_UNAVAILABLE,
            MESSAGE_ENUM.SOMETHING_WENT_WRONG,
            { errors: e.message }
          );
        });
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }
}

export default new UserController();
