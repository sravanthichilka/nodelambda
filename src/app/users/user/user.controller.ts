import statusCodes from "http-status-codes";
import HelperController from "../../auth/auth.helper";
import log from "../../../helper/logs";
import userRepo from "../users.repo";
import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";
import MESSAGE_ENUM from "../../../helper/message";
import eventRepo from "../../eventLogs/eventlogs.repo";

class UserController extends HelperController {
  async userProfile(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
      } = req;

      let user: any = await userRepo.searchUser({ id: consumeUserId });

      delete user.id;

      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;

      if (
        consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER ||
        consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER
      ) {
        user.phoneNumber = req.body.phoneNumber;
      }

      await userRepo.updateUser(consumeUserId, user);
      let updateData: any = await userRepo.searchUser({ id: consumeUserId });
      const data = {
        id: updateData.id,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phoneNumber: updateData.phoneNumber,
        regionId: updateData.regionId,
      };
      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.EDIT_PROFILE_SUCCESSFULLY, data);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async userMe(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
      } = req;

      let user: any = await userRepo.searchUser({ id: consumeUserId });
      delete user.salt;
      delete user.hash;
      const data = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        regionId: user.regionId,
      };
      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.MY_PROFILE_DATA, data);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async myEventLog(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { filter, sortBy, currentPage, recordPerPage },
      } = req;

      const sortObject: Record<string, 1 | -1> = { createdAt: -1 };
      const conditionObject: any = { userId: consumeUserId };

      if (filter) {
        if (filter.eventTypeId) {
          conditionObject["eventTypeId"] = filter.eventTypeId;
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

  async setPassword(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId },
        body: { password },
      } = req;

      const condition = { id: consumeUserId };
      log.info([condition, "setPassword"]);
      const userFind: any = await userRepo.searchUser(condition);

      if (!userFind.setTemporaryPassword) {
        return res.sendErrorResponse(
          statusCodes.FORBIDDEN,
          MESSAGE_ENUM.NOT_AUTHORIZED_TO_SET_PASSWORD
        );
      }

      let salt = userFind.salt;

      const hash = await super.createHash(salt, userFind.email, password);

      const updateUserDate: any = { setTemporaryPassword: 0, salt, hash };

      if (userFind.status === ENUM_User_Status.PENDING) {
        updateUserDate.status = ENUM_User_Status.ACTIVE;
      }

      const isUserUpdated = await userRepo.updateUser(consumeUserId, updateUserDate);

      log.info([condition, "setPassword"]);
      if (isUserUpdated) {
        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.PASSWORD_CHANGE_SUCCESSFULLY);
      } else {
        return res.sendErrorResponse(
          statusCodes.INTERNAL_SERVER_ERROR,
          MESSAGE_ENUM.SOMETHING_WENT_WRONG
        );
      }
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
