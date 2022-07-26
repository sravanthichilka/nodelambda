import statusCodes from "http-status-codes";
import customerRepo from "./regions.repo";
import HelperController from "../auth/auth.helper";
import log from "../../helper/logs";
import {
  ENUM_REGION_STATUS,
} from "../../helper/constants";
import {
  createPresignedPost as _createPresignedPost,
  createCloudFrontPresigned as _createCloudFrontPresigned,
} from "../../helper/s3-service";
import MESSAGE_ENUM from "../../helper/message";

class CustomerController extends HelperController {
  async fetchRegionTypes(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        params: {},
      } = req;

      const sqlQuery: any = [];
      const sqlQueryParams: any = [];

      const sortObject: any = { column: "id", order: "asc" };
      const pageLimitObj = { limit: 100, offset: 0 };

      sqlQuery.push(` status=? `);
      sqlQueryParams.push(ENUM_REGION_STATUS.ACTIVE);

      let sqlQueryBuilder = sqlQuery.join(" and ");
      let sqlQueryBuilderList = sqlQueryParams;

      let documentTypesList = await customerRepo.getRegionFetchList(
        sqlQueryBuilder,
        sqlQueryBuilderList,
        { sortObject, pageLimit: pageLimitObj }
      );

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
