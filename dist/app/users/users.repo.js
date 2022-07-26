"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const unProcessableError_1 = __importDefault(require("../../helper/error/unProcessableError"));
const connection = require("../../config/database").Knex.config;
const db = knex_1.default(connection);
const logs_1 = __importDefault(require("../../helper/logs"));
class UserRepo {
    //okay
    findEmail(email) {
        return new Promise(function (resolve) {
            db("users as u")
                .select("*", db.raw("CONCAT_WS(' ', firstName, lastName) as fullName"))
                .where("email", email)
                .first()
                .catch(function (error) {
                logs_1.default.info(["findEmail", error.message]);
                resolve(null);
            })
                .then(function (data) {
                resolve(data);
            });
        });
    }
    //okay
    findUserForLoginData(email) {
        return new Promise(function (resolve) {
            db("users")
                .select("id", "email", "firstName", "lastName", "phoneNumber", "regionId", "role", "status", "setTemporaryPassword", "CreatedAt", "UpdatedAt", "salt", "hash", db.raw("CONCAT_WS(' ', firstName, lastName) as fullName"), "last_logged_in")
                .where("email", email)
                .first()
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["findUserForLoginData", error.message]);
                resolve(null);
            });
        });
    }
    getUsersList(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("users AS u")
                .leftOuterJoin("regions AS r", "r.id", "u.regionId")
                .select("u.id", "u.email", "u.firstName", "u.lastName", "u.phoneNumber", "u.regionId", "r.regionName", "u.role", "u.status", "u.CreatedAt", "u.UpdatedAt")
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .offset(data.pageLimit.offset)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getUsersList", error.message]);
                resolve([]);
            });
        });
    }
    getUsersListCount(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("users AS u")
                .leftOuterJoin("regions AS r", "r.id", "u.regionId")
                .where(db.raw(sql, sqlP));
            user.count({ count: "*" });
            user
                .then(function (data) {
                resolve(data[0].count);
            })
                .catch(function (error) {
                logs_1.default.info(["getUsersList", error.message]);
                resolve(0);
            });
        });
    }
    userRole(user_id) {
        return new Promise(function (resolve) {
            db("UsersRoles")
                .where("UserID", user_id)
                .pluck("RoleID")
                .catch(function (error) {
                logs_1.default.info(["findUserName", error.message]);
                resolve(null);
            })
                .then(function (data) {
                resolve(data);
            });
        });
    }
    updateLastLoggedIn(user_id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = { last_logged_in: db.fn.now(), UpdatedAt: db.fn.now() };
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const userResponse = yield trx("users").where({ id: user_id }).update(data);
                    return resolve(userResponse);
                }));
            }
            catch (error) {
                logs_1.default.info(["trx updateUser - error - ", error.message]);
                return reject(0);
            }
        }));
    }
    //okay
    updateUser(user_id, data) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (data.fullName) {
                    delete data.fullName;
                }
                data.UpdatedAt = db.fn.now();
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const userResponse = yield trx("users").where({ id: user_id }).update(data);
                    return resolve(userResponse);
                }));
            }
            catch (error) {
                logs_1.default.info(["trx updateUser - error - ", error.message]);
                return reject(0);
            }
        }));
    }
    //okay
    searchUser(condition) {
        return new Promise(function (resolve) {
            logs_1.default.info([condition, "condition"]);
            db("users")
                .select("*", db.raw("CONCAT_WS(' ', firstName, lastName) as fullName"))
                .where(condition)
                .first()
                .then(function (data) {
                if (data) {
                    resolve(data);
                }
                else {
                    resolve(null);
                }
            })
                .catch(function (error) {
                logs_1.default.info(["searchUser", error.message]);
                resolve(null);
            });
        });
    }
    updateData(data, table_name, user_id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const userResponse = yield trx(table_name).where({ UserID: user_id }).update(data);
                    return resolve(userResponse);
                }));
            }
            catch (error) {
                logs_1.default.info(["trx updateData - error - ", error.message]);
                return reject(null);
            }
        }));
    }
    //okay
    createUser(data, createdBy) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                data.createdBy = createdBy;
                data.CreatedAt = db.fn.now();
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const dataResponse = yield trx("users").insert(data);
                    return resolve(dataResponse[0]);
                }));
            }
            catch (error) {
                logs_1.default.info(["trx createUser - error - ", error.message]);
                return reject({
                    error,
                    errNo: error.errno,
                    errMgs: error.message,
                    sqlMgs: error.sqlMessage,
                });
            }
        }));
    }
    isUserEmailUnique(email, userId) {
        return new Promise(function (resolve, reject) {
            db("users")
                .count({ count: "*" })
                .where({ email: email })
                .whereNot("id", userId)
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve(false);
                }
                resolve(data[0]["count"] === 0 ? true : false);
            })
                .catch(function (error) {
                logs_1.default.info(["isUserEmailUnique", error.message]);
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
    userMetaData(userId) {
        return new Promise(function (resolve, reject) {
            let user = db("users AS u")
                .leftJoin("regions AS r", "u.regionId", "r.id")
                .leftJoin("users AS cby", "cby.id", "u.CreatedBy")
                .leftJoin("users AS uby", "uby.id", "u.UpdatedBy")
                .select("u.firstName", "u.lastName", "u.email", "r.regionName", "u.phoneNumber", "u.CreatedAt As userCreatedAt", "u.UpdatedAt As userUpdatedAt", "cby.id As createdUserId", db.raw(`CONCAT_WS(" ", cby.firstName, cby.lastName) AS createdFullName`), "uby.id As updatedUserId", db.raw(`CONCAT_WS(" ", uby.firstName, uby.lastName) AS updatedFullName`))
                .first()
                .where({ "u.id": userId })
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getDocumentList", error.message]);
                reject(new unProcessableError_1.default("user not found."));
            });
        });
    }
}
exports.default = new UserRepo();
