import statusCodes from 'http-status-codes';
import teamMemberRepo from './teammembers.repo';
import HelperController from '../auth/auth.helper'
import log from '../../helper/logs';
import MESSAGE_ENUM from '../../helper/message';

class TeamMemberController extends HelperController {

    // fetch all team member while assign customer 
    async fetchTeamMember(req: any, res: any) {
        try {

            const { user: { id, role: consumeUserRole },
                query: {
                    filter
                } } = req;

            const sqlQuery = [];
            const sqlQueryParams = [];

            const sortObject: any = { column: "firstName", order: "asc" };
            const pageLimitObj = { limit: 100 };

            sqlQuery.push(` id != ? `);
            sqlQueryParams.push(id);


            if (filter) {
                if (filter.firstLastAndEmail) {
                    sqlQuery.push(`( firstName like ? or lastName like ? or email like ? )`);
                    sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                    sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                    sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
                }
            }

            let sqlQueryBuilder = sqlQuery.join(" and ");
            let sqlQueryBuilderList = sqlQueryParams;

            const fetchTeamMemberPromise = teamMemberRepo.fetchTeamMember(sqlQueryBuilder, sqlQueryBuilderList, { sortObject, pageLimit: pageLimitObj });

            let userList = await fetchTeamMemberPromise;

            const data = {
                records: userList,
            };

            return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, data);
            
        } catch (Error: any) {
            log.error(['additionalInformation', Error])
            return res.sendErrorResponse(Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR, Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG, { errors: Error.message });
          }
    }


}

export default new TeamMemberController();