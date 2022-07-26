import knex from "knex";
const connection = require("../../config/database").Knex.config;
const db = knex(connection);
import log from "../../helper/logs";

class AuthRepo {
  insertAuthTokens(
    user_id: number,
    userAgent: string,
    refresh: string,
    expireTokenInSecond = 216000
  ): Promise<number | void> {
    return new Promise(async (resolve, reject) => {
      try {
        await db.transaction(async (trx) => {
          const data = await trx("user_tokens").insert({
            userId: user_id,
            userAgent: userAgent,
            refreshToken: refresh,
            issueAt: db.raw("NOW()"),
            expireAt: db.raw(`DATE_ADD(NOW(), INTERVAL ${expireTokenInSecond} second)`),
          });
          return resolve(data[0]);
        });
      } catch (error: any) {
        log.info(["trx insertAuthTokens - error - ", error.message]);
        return reject(error);
      }
    });
  }
  updateAcessToken(
    userId: number,
    oldRefreshToken: string,
    refreshToken: string,
    expireTokenInSecond = 216000
  ): Promise<number | void> {
    return new Promise(async (resolve, reject) => {
      try {
        await db.transaction(async (trx) => {
          const data = await trx("user_tokens")
            .where({ userId: userId, refreshToken: oldRefreshToken })
            .update({
              refreshToken: refreshToken,
              issueAt: db.raw("NOW()"),
              expireAt: db.raw(`DATE_ADD(NOW(), INTERVAL ${expireTokenInSecond} second)`),
            });
          return resolve(data);
        });
      } catch (error: any) {
        log.info(["trx updateAcessToken - error - ", error.message]);
        return reject(error);
      }
    });
  }
  accessTokenVerification(condition: any) {
    return new Promise(function (resolve) {
      db("Users as u")
        .join("UserTokens as ut", "ut.UserID", "u.UserID")
        .join("UsersRoles as ur", "ur.UserID", "u.UserID")
        .leftJoin("Drivers as d", "d.UserID", "u.UserID")
        .where(condition)
        .select(
          "u.*",
          "d.ShippingAddressID",
          "ur.RoleID",
          db.raw("isnull(d.DriverType,'') as UserSubType")
        )
        .first()
        .catch(function (error: any) {
          log.info(["tokenVerified - error - ", error.message]);
          resolve(null);
        })
        .then(function (data) {
          resolve(data);
        });
    });
  }
  removeAccessTokens(userId: number, refreshToken: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.transaction(async (trx) => {
          const data = await trx("user_tokens").where({ userId, refreshToken }).del();
          return resolve(data);
        });
      } catch (error: any) {
        log.info(["trx removeAccessTokens - error - ", error.message]);
        return reject(new Error("Token not found"));
      }
    });
  }
}
export default new AuthRepo();
