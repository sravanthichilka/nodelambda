import knex from 'knex';
import { ENUM_User_ROLE } from '../../helper/constants';
const connection = require('../../config/database').Knex.config;
const db = knex(connection);
import log from '../../helper/logs';


interface sortByModel{
    column: string;
    order: string;
}

interface getUserListModal{
    conditions: object;
    sortObject: sortByModel;
    pageLimit: { limit:number, offset: number}      
};

class TeamMemberRepo {

     // fetch all team member while assign customer 
     //not matter active or inactive
     fetchTeamMember(sql: any, sqlP: any, data:any ) {
        return new Promise(function (resolve) {
       
             db('users')
                 .select('id', 'email', 'firstName', 'lastName','status','role', "phoneNumber")
                 .where({role: ENUM_User_ROLE.TEAM_MEMBER})
                 .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .then(function (data: any) {
                    resolve(data)
                })
                .catch(function (error: any) {
                    log.info(['fetchTeamMember', error.message])
                    resolve(null)
                })
        })
    }

 

}
export default new TeamMemberRepo();