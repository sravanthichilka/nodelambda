import knex from "knex";
const connection = require("../../config/database").Knex.config;
const db = knex(connection);
import log from "../../helper/logs";

class UserRepo {
  getRegionFetchList(sql: any, sqlP: any, data: any) {
    return new Promise(function (resolve) {
      let user = db("regions")
        .select("id", "regionName")
        .where(db.raw(sql, sqlP))
        .orderBy(data.sortObject.column, data.sortObject.order)
        .limit(data.pageLimit.limit)
        .offset(data.pageLimit.offset)

        .then(function (data: any) {
          resolve(data);
        })
        .catch(function (error: any) {
          log.info(["getRegionFetchList", error.message]);
          resolve(null);
        });
    });
  }
}
export default new UserRepo();
