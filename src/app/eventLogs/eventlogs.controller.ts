import statusCodes from "http-status-codes";
import eventRepo from "./eventlogs.repo";
import HelperController from "../auth/auth.helper";
import log from "../../helper/logs";
import MESSAGE_ENUM from "../../helper/message";
import UnProcessableError from "../../helper/error/unProcessableError";
import { ENUM_User_ROLE } from "../../helper/constants";
import customerRepo from "../customers/customers.repo";
import userRepo from "../users/users.repo";

class CustomerController extends HelperController {
  async fetchEventTypes(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { filter, sortBy, currentPage, recordPerPage },
      } = req;

      const sortObject: any = { createdAt: -1 };
      let conditionObject: any = {};

      if (consumeUserRole === ENUM_User_ROLE.SUPERADMIN) {
        conditionObject["userRoleId"] = {
          $in: [
            ENUM_User_ROLE.SUPERADMIN,
            ENUM_User_ROLE.ADMIN,
            ENUM_User_ROLE.TEAM_MEMBER,
            ENUM_User_ROLE.CUSTOMER_USER,
          ],
        };
        conditionObject["alterRecordUserRoleId"] = {
          $in: [
            ENUM_User_ROLE.SUPERADMIN,
            ENUM_User_ROLE.ADMIN,
            ENUM_User_ROLE.TEAM_MEMBER,
            ENUM_User_ROLE.CUSTOMER_USER,
          ],
        };
      } else if (consumeUserRole === ENUM_User_ROLE.ADMIN) {
        conditionObject["$or"] = [
          {
            alterRecordUserRoleId: {
              $in: [ENUM_User_ROLE.TEAM_MEMBER, ENUM_User_ROLE.CUSTOMER_USER],
            },
          },
          { userRoleId: { $in: [ENUM_User_ROLE.TEAM_MEMBER, ENUM_User_ROLE.CUSTOMER_USER] } },
          { userId: consumeUserId },
          { alterRecordUserId: consumeUserId },
        ];
      } else if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        conditionObject["$or"] = [{ userId: consumeUserId }, { alterRecordUserId: consumeUserId }];

        if (!(filter && filter.companyId)) {
          const teamMemberData: any = await customerRepo.getCompanyListFromTeammember(
            consumeUserId
          );

          if (teamMemberData && teamMemberData.length) {
            const companyArray = teamMemberData.map((filter: any) => {
              return filter.companyId;
            });
            conditionObject["$or"].push({ companyId: { $in: companyArray } });
          }
        }
      }

      if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        if (filter) {
          if (filter.userId) {
            conditionObject["$or"] = [
              { userId: filter.userId },
              { alterRecordUserId: filter.userId },
            ];

            let user: any = await userRepo.searchUser({ id: filter.userId });

            if (!user) {
              return res.sendErrorResponse(
                statusCodes.UNPROCESSABLE_ENTITY,
                MESSAGE_ENUM.RECORD_NOT_FOUND
              );
            }

            if (consumeUserRole !== ENUM_User_ROLE.SUPERADMIN) {
              super.validateCurrentRoleAuthorize(consumeUserRole, user.role);
            }
          }
          if (filter.eventTypeId) {
            conditionObject["eventTypeId"] = filter.eventTypeId;
          }
          if (filter.companyId) {
            delete conditionObject["$or"];
            conditionObject["companyId"] = filter.companyId;
          }
          if (filter.documentId) {
            delete conditionObject["$or"];
            conditionObject["documentId"] = filter.documentId;
          }
        }
      } else {
        if (filter) {
          if (filter.eventTypeId) {
            conditionObject["eventTypeId"] = filter.eventTypeId;
          }
          if (filter.companyId) {
            conditionObject["companyId"] = filter.companyId;
          }
          if (filter.documentId) {
            conditionObject["documentId"] = filter.documentId;
          }
          if (filter.userId) {
            conditionObject["$or"] = [
              { userId: filter.userId },
              { alterRecordUserId: filter.userId },
            ];

            let user: any = await userRepo.searchUser({ id: filter.userId });

            if (!user) {
              return res.sendErrorResponse(
                statusCodes.UNPROCESSABLE_ENTITY,
                MESSAGE_ENUM.RECORD_NOT_FOUND
              );
            }

            if (consumeUserRole !== ENUM_User_ROLE.SUPERADMIN) {
              super.validateCurrentRoleAuthorize(consumeUserRole, user.role);
            }
          }
        }
      }

      const { totalRecordCount, totalRecord } = await eventRepo.getDocumentTypeFetchList(
        conditionObject,
        sortObject,
        currentPage,
        recordPerPage
      );

      const totalPages = Math.ceil(totalRecordCount / recordPerPage);
      const data = {
        records: totalRecord,
        recordsMetaData: {
          recordPerPage,
          currentPage,
          totalPages,
          totalRecords: totalRecordCount,
        },
        conditionObject,
      };

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, data);
    } catch (Error: any) {
      log.error(["fetchEventTypes", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async superAdminFetchEventTypes(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { filter, sortBy, currentPage, recordPerPage },
      } = req;

      const sortObject: any = { createdAt: -1 };
      const conditionObject: any = {};

      conditionObject["userRoleId"] = {
        $in: [
          ENUM_User_ROLE.SUPERADMIN,
          ENUM_User_ROLE.ADMIN,
          ENUM_User_ROLE.TEAM_MEMBER,
          ENUM_User_ROLE.CUSTOMER_USER,
        ],
      };
      conditionObject["alterRecordUserRoleId"] = {
        $in: [
          ENUM_User_ROLE.SUPERADMIN,
          ENUM_User_ROLE.ADMIN,
          ENUM_User_ROLE.TEAM_MEMBER,
          ENUM_User_ROLE.CUSTOMER_USER,
        ],
      };

      if (filter) {
        if (filter.eventTypeId) {
          conditionObject["eventTypeId"] = filter.eventTypeId;
        }
        if (filter.companyId) {
          conditionObject["companyId"] = filter.companyId;
        }
        if (filter.userId) {
          conditionObject["$or"] = [];
          conditionObject["$or"].push({ userId: filter.userId });
          conditionObject["$or"].push({ alterRecordUserId: filter.userId });

          let user: any = await userRepo.searchUser({ id: filter.userId });
          if (!user) {
            return res.sendErrorResponse(
              statusCodes.UNPROCESSABLE_ENTITY,
              MESSAGE_ENUM.RECORD_NOT_FOUND
            );
          }
        }
        if (filter.documentId) {
          conditionObject["documentId"] = filter.documentId;
        }
      }

      const { totalRecordCount, totalRecord } = await eventRepo.getDocumentTypeFetchList(
        conditionObject,
        sortObject,
        currentPage,
        recordPerPage
      );

      const totalPages = Math.ceil(totalRecordCount / recordPerPage);
      const data = {
        records: totalRecord,
        recordsMetaData: {
          recordPerPage,
          currentPage,
          totalPages,
          totalRecords: totalRecordCount,
        },
        conditionObject,
      };

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, data);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async eventTypeId(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        params: { id: eventLogId },
      } = req;

      const records: any = await eventRepo.getEventLogDetail(eventLogId);
      if (records) {
        const finalResult: any = records.toObject();
        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, finalResult);
      } else {
        throw new UnProcessableError(MESSAGE_ENUM.RECORD_NOT_FOUND);
      }
    } catch (Error: any) {
      log.error(["eventTypeId", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }
}

export default new CustomerController();
