import statusCodes from "http-status-codes";
import HelperController from "../auth/auth.helper";
import log from "../../helper/logs";
import MESSAGE_ENUM from "../../helper/message";
import { ENUM_User_ROLE } from "../../helper/constants";
import { ENUM_EVENT_TYPE_LOGS } from "../../helper/constants";

class CustomerController extends HelperController {
  async fetchEventTypes(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        params: {},
        query: { showCustomerEventLogList },
      } = req;

      let documentTypesList = Object.values(ENUM_EVENT_TYPE_LOGS);
      let adminDisAllow: number[] = [
        ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_CREATED.id,
        ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_UPDATED.id,
        ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_ACTIVATED.id,
        ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_DEACTIVATED.id,
      ];
      let teamMemberDisAllow: number[] = [
        ...adminDisAllow,
        ENUM_EVENT_TYPE_LOGS.ADMIN_CREATED.id,
        ENUM_EVENT_TYPE_LOGS.ADMIN_UPDATED.id,
        ENUM_EVENT_TYPE_LOGS.ADMIN_ACTIVATED.id,
        ENUM_EVENT_TYPE_LOGS.ADMIN_DEACTIVATED.id,
      ];
      let customerUserDisAllow: number[] = [
        ...teamMemberDisAllow,
        ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_CREATED.id,
        ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_UPDATED.id,
        ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_ACTIVATED.id,
        ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_DEACTIVATED.id,
      ];
      if (consumeUserRole === ENUM_User_ROLE.ADMIN) {
        documentTypesList = Object.values(ENUM_EVENT_TYPE_LOGS).filter(
          (rec) => !adminDisAllow.includes(rec.id)
        );
      } else if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        documentTypesList = Object.values(ENUM_EVENT_TYPE_LOGS).filter(
          (rec) => !teamMemberDisAllow.includes(rec.id)
        );
      } else if (consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER) {
        documentTypesList = Object.values(ENUM_EVENT_TYPE_LOGS).filter(
          (rec) => !customerUserDisAllow.includes(rec.id)
        );
      }

      if (showCustomerEventLogList) {
        documentTypesList = Object.values(ENUM_EVENT_TYPE_LOGS).filter(
          (rec) => !customerUserDisAllow.includes(rec.id)
        );
      }

      const data = {
        records: documentTypesList,
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
}

export default new CustomerController();
