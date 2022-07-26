import knex from "knex";
import UnProcessableError from "../../helper/error/unProcessableError";
const connection = require("../../config/database").Knex.config;
const db = knex(connection);
import log from "../../helper/logs";
import {
  findUserForLoginDataInterface,
  UserListingInterface,
  userMetaDataInterface,
} from "./user.interface";

interface sortByModel {
  column: string;
  order: string;
}

interface getUserListModal {
  conditions: object;
  sortObject: sortByModel;
  pageLimit: { limit: number; offset: number };
}

class UserRepo {
  //okay
  findEmail(email: string): Promise<Object | null> {
    return new Promise(function (resolve) {
      db("users as u")
        .select("*", db.raw("CONCAT_WS(' ', firstName, lastName) as fullName"))
        .where("email", email)
        .first()
        .catch(function (error: any) {
          log.info(["findEmail", error.message]);
          resolve(null);
        })
        .then(function (data) {
          resolve(data);
        });
    });
  }

  //okay
  findUserForLoginData(email: string): Promise<findUserForLoginDataInterface | null> {
    return new Promise(function (resolve) {
      db("users")
        .select(
          "id",
          "email",
          "firstName",
          "lastName",
          "phoneNumber",
          "regionId",
          "role",
          "status",
          "setTemporaryPassword",
          "CreatedAt",
          "UpdatedAt",
          "salt",
          "hash",
          db.raw("CONCAT_WS(' ', firstName, lastName) as fullName"),
          "last_logged_in"
        )
        .where("email", email)
        .first()
        .then(function (data) {
          resolve(data);
        })
        .catch(function (error: any) {
          log.info(["findUserForLoginData", error.message]);
          resolve(null);
        });
    });
  }

  getUsersList(sql: any, sqlP: any, data: any): Promise<UserListingInterface[]> {
    return new Promise(function (resolve) {
      let user = db("users AS u")
        .leftOuterJoin("regions AS r", "r.id", "u.regionId")
        .select(
          "u.id",
          "u.email",
          "u.firstName",
          "u.lastName",
          "u.phoneNumber",
          "u.regionId",
          "r.regionName",
          "u.role",
          "u.status",
          "u.CreatedAt",
          "u.UpdatedAt"
        )
        .where(db.raw(sql, sqlP))
        .orderBy(data.sortObject.column, data.sortObject.order)
        .limit(data.pageLimit.limit)
        .offset(data.pageLimit.offset)
        .then(function (data: any) {
          resolve(data);
        })
        .catch(function (error: any) {
          log.info(["getUsersList", error.message]);
          resolve([]);
        });
    });
  }

  getUsersListCount(sql: any, sqlP: any, data: any): Promise<number> {
    return new Promise(function (resolve) {
      let user = db("users AS u")
        .leftOuterJoin("regions AS r", "r.id", "u.regionId")
        .where(db.raw(sql, sqlP));
      user.count({ count: "*" });

      user
        .then(function (data: any) {
          resolve(data[0].count);
        })
        .catch(function (error: any) {
          log.info(["getUsersList", error.message]);
          resolve(0);
        });
    });
  }

  userRole(user_id: number) {
    return new Promise(function (resolve) {
      db("UsersRoles")
        .where("UserID", user_id)
        .pluck("RoleID")
        .catch(function (error: any) {
          log.info(["findUserName", error.message]);
          resolve(null);
        })
        .then(function (data: any) {
          resolve(data);
        });
    });
  }

  updateLastLoggedIn(user_id: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = { last_logged_in: db.fn.now(), UpdatedAt: db.fn.now() };
        await db.transaction(async (trx) => {
          const userResponse = await trx("users").where({ id: user_id }).update(data);
          return resolve(userResponse);
        });
      } catch (error: any) {
        log.info(["trx updateUser - error - ", error.message]);
        return reject(0);
      }
    });
  }

  //okay
  updateUser(user_id: number, data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data.fullName) {
          delete data.fullName;
        }

        data.UpdatedAt = db.fn.now();
        await db.transaction(async (trx) => {
          const userResponse = await trx("users").where({ id: user_id }).update(data);
          return resolve(userResponse);
        });
      } catch (error: any) {
        log.info(["trx updateUser - error - ", error.message]);
        return reject(0);
      }
    });
  }

  //okay
  searchUser(condition: any) {
    return new Promise(function (resolve) {
      log.info([condition, "condition"]);
      db("users")
        .select("*", db.raw("CONCAT_WS(' ', firstName, lastName) as fullName"))
        .where(condition)
        .first()
        .then(function (data: any) {
          if (data) {
            resolve(data);
          } else {
            resolve(null);
          }
        })
        .catch(function (error: any) {
          log.info(["searchUser", error.message]);
          resolve(null);
        });
    });
  }

  updateData(data: any, table_name: any, user_id: any) {
    return new Promise(async (resolve, reject) => {
      try {
        await db.transaction(async (trx) => {
          const userResponse = await trx(table_name).where({ UserID: user_id }).update(data);
          return resolve(userResponse);
        });
      } catch (error: any) {
        log.info(["trx updateData - error - ", error.message]);
        return reject(null);
      }
    });
  }

  //okay
  createUser(
    data: any,
    createdBy: number
  ): Promise<number | { error: object; errNo: number; errMgs: string; sqlMgs: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        data.createdBy = createdBy;
        data.CreatedAt = db.fn.now();
        await db.transaction(async (trx) => {
          const dataResponse = await trx("users").insert(data);
          return resolve(dataResponse[0]);
        });
      } catch (error: any) {
        log.info(["trx createUser - error - ", error.message]);
        return reject({
          error,
          errNo: error.errno,
          errMgs: error.message,
          sqlMgs: error.sqlMessage,
        });
      }
    });
  }

  isUserEmailUnique(email: string, userId: number): Promise<boolean> {
    return new Promise(function (resolve, reject) {
      db("users")
        .count({ count: "*" })
        .where({ email: email })
        .whereNot("id", userId)
        .then(function (data: any) {
          if (!(data && data.length)) {
            resolve(false);
          }
          resolve(data[0]["count"] === 0 ? true : false);
        })
        .catch(function (error: any) {
          log.info(["isUserEmailUnique", error.message]);
          resolve(false);
        });
    });
  }

  /*
 "firstName": "add_new_user_fn",
        "lastName": "add_new_user_ln",
        "email": "add_user_s_a@yopmail.com",
        "regionName": null,
        "phoneNumber": null,
        "userCreatedAt": "2022-03-22T07:14:48.000Z",
        "userUpdatedAt": null,
        "createdUserId": 2,
        "createdFullName": "annapurna kenguva",
        "updatedUserId": null,
        "updatedFullName": ""
      */
  userMetaData(userId: number): Promise<userMetaDataInterface> {
    return new Promise(function (resolve, reject) {
      let user = db("users AS u")
        .leftJoin("regions AS r", "u.regionId", "r.id")
        .leftJoin("users AS cby", "cby.id", "u.CreatedBy")
        .leftJoin("users AS uby", "uby.id", "u.UpdatedBy")
        .select(
          "u.firstName",
          "u.lastName",
          "u.email",
          "r.regionName",
          "u.phoneNumber",
          "u.CreatedAt As userCreatedAt",
          "u.UpdatedAt As userUpdatedAt",
          "cby.id As createdUserId",
          db.raw(`CONCAT_WS(" ", cby.firstName, cby.lastName) AS createdFullName`),
          "uby.id As updatedUserId",
          db.raw(`CONCAT_WS(" ", uby.firstName, uby.lastName) AS updatedFullName`)
        )
        .first()
        .where({ "u.id": userId })
        .then(function (data: any) {
          resolve(data);
        })
        .catch(function (error: any) {
          log.info(["getDocumentList", error.message]);
          reject(new UnProcessableError("user not found."));
        });
    });
  }
}
export default new UserRepo();
