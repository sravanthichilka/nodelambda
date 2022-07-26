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
const constants_1 = require("../../helper/constants");
const unProcessableError_1 = __importDefault(require("../../helper/error/unProcessableError"));
const connection = require("../../config/database").Knex.config;
const db = knex_1.default(connection);
const logs_1 = __importDefault(require("../../helper/logs"));
const auth_helper_1 = __importDefault(require("../auth/auth.helper"));
const message_1 = __importDefault(require("../../helper/message"));
class UserRepo {
    getCompanyList(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("users AS u")
                .join("company_users AS cu", "cu.userId", "u.id")
                .join("companies AS c", "cu.companyId", "c.id")
                .leftJoin("assign_team_members AS atm", "atm.companyId", "c.id")
                .join("regions AS r", "r.id", "c.regionId")
                .select("u.id As userId", "c.id As companyId", "u.email", " u.firstName", "u.lastName", " c.regionId", " r.regionName", " u.status", " u.role", "c.companyName", "c.uniqueId", "cu.isCompanyOwner", "c.onSiteSystemData")
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .groupBy(`userId`, `companyId`, `email`, `firstName`, `lastName`, `regionId`, `regionName`, `status`, `role`, `companyName`, `uniqueId`, `isCompanyOwner`, `onSiteSystemData`)
                .limit(data.pageLimit.limit)
                .offset(data.pageLimit.offset)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getCompanyList", error.message]);
                resolve(null);
            });
        });
    }
    getCompanyListCount(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("users AS u")
                .join("company_users AS cu", "cu.userId", "u.id")
                .join("companies AS c", "cu.companyId", "c.id")
                .leftJoin("assign_team_members AS atm", "atm.companyId", "c.id")
                .join("regions AS r", "r.id", "c.regionId")
                .where(db.raw(sql, sqlP));
            user
                .countDistinct("u.id as count")
                .orderBy(data.sortObject.column, data.sortObject.order)
                .then(function (data) {
                resolve(data[0].count);
            })
                .catch(function (error) {
                logs_1.default.info(["getCompanyListCount", error.message]);
                resolve(0);
            });
        });
    }
    //okay
    createUser(customerData, createdBy) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                customerData.companyInfo.preS3KeyName = auth_helper_1.default.createNanoid();
                customerData.customerUser.createdBy = createdBy;
                customerData.customerUser.CreatedAt = db.fn.now();
                customerData.companyInfo.createdBy = createdBy;
                customerData.companyInfo.createdAt = db.fn.now();
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const userDataResp = yield trx("users").insert(customerData.customerUser);
                    const userId = userDataResp[0];
                    const companyDataResp = yield trx("companies").insert(customerData.companyInfo);
                    const companyId = companyDataResp[0];
                    const company_users = {
                        userId: userId,
                        companyId: companyId,
                        isCompanyOwner: true,
                        createdBy: createdBy,
                    };
                    const companyUserDataResp = yield trx("company_users").insert(company_users);
                    const assignedTeamMemberList = [];
                    for (let assignedTeamMemberId of customerData.assignedTeamMember) {
                        assignedTeamMemberList.push({
                            companyId,
                            assignUserId: assignedTeamMemberId,
                            createdBy,
                        });
                    }
                    if (assignedTeamMemberList && assignedTeamMemberList.length) {
                        const assignTeamMembers = yield trx("assign_team_members").insert(assignedTeamMemberList);
                        const assignTeamMemberId = assignTeamMembers[0];
                        return resolve({ assignTeamMemberId, companyId, userId });
                    }
                    else {
                        return resolve({ assignTeamMemberId: 0, companyId, userId });
                    }
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
    updateCompany(consumeUserRole, companyAliasUserId, updateCustomerData, createdBy) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                updateCustomerData.customerUser.updatedBy = createdBy;
                updateCustomerData.customerUser.UpdatedAt = db.fn.now();
                updateCustomerData.companyInfo.updatedBy = createdBy;
                updateCustomerData.companyInfo.updatedAt = db.fn.now();
                yield db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    yield trx("users")
                        .where({ id: companyAliasUserId.userId })
                        .update(updateCustomerData.customerUser);
                    yield trx("companies")
                        .where({ id: companyAliasUserId.companyId })
                        .update(updateCustomerData.companyInfo);
                    if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                        return resolve({
                            consumeUserRole,
                            assignTeamMemberId: 0,
                            companyId: companyAliasUserId.companyId,
                            userId: companyAliasUserId.userId,
                        });
                    }
                    else if (consumeUserRole === constants_1.ENUM_User_ROLE.SUPERADMIN ||
                        consumeUserRole === constants_1.ENUM_User_ROLE.ADMIN) {
                        yield trx("assign_team_members").where("companyId", companyAliasUserId.companyId).del();
                        const assignedTeamMemberList = [];
                        for (let assignedTeamMemberId of updateCustomerData.assignedTeamMember) {
                            assignedTeamMemberList.push({
                                companyId: companyAliasUserId.companyId,
                                assignUserId: assignedTeamMemberId,
                                createdBy,
                            });
                        }
                        if (assignedTeamMemberList && assignedTeamMemberList.length) {
                            const assignTeamMembers = yield trx("assign_team_members").insert(assignedTeamMemberList);
                            const assignTeamMemberId = assignTeamMembers[0];
                            return resolve({
                                consumeUserRole,
                                assignTeamMemberId,
                                companyId: companyAliasUserId.companyId,
                                userId: companyAliasUserId.userId,
                            });
                        }
                        else {
                            return resolve({
                                consumeUserRole,
                                assignTeamMemberId: 0,
                                companyId: companyAliasUserId.companyId,
                                userId: companyAliasUserId.userId,
                            });
                        }
                    }
                    else {
                        return reject(new Error(message_1.default.OTHER_ROLE_CAN_NOT_USE_THIS_METHOD));
                    }
                }));
            }
            catch (error) {
                logs_1.default.info(["trx updateCompany - error - ", error.message]);
                return reject({
                    error,
                    errNo: error.errno,
                    errMgs: error.message,
                    sqlMgs: error.sqlMessage,
                });
            }
        }));
        ///
    }
    // not matter active or inactive
    checkAllTeamMemberIds(teamMemberIds) {
        return new Promise(function (resolve, reject) {
            db("users")
                .select("id As userId")
                .where({ role: constants_1.ENUM_User_ROLE.TEAM_MEMBER })
                .whereIn("id", teamMemberIds)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["checkAllTeamMemberIds", error.message]);
                reject(error);
            });
        });
    }
    deactiveCompany(companyId) {
        return new Promise(function (resolve, reject) {
            db("users")
                .select("id As userId")
                .where({ status: constants_1.ENUM_User_Status.ACTIVE, role: constants_1.ENUM_User_ROLE.TEAM_MEMBER })
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["checkAllTeamMemberIds", error.message]);
                reject(error);
            });
        });
    }
    getUserIdFromCompanyId(companyId) {
        return new Promise(function (resolve, reject) {
            let user = db("companies As c")
                .join("company_users AS cu", "cu.companyId", "c.id")
                .select("cu.companyId ", "cu.userId")
                .where({ "c.id": companyId, "cu.isCompanyOwner": true })
                .then(function (data) {
                if (!(data && data.length)) {
                    reject(new Error("Company data not found"));
                }
                resolve(data[0]);
            })
                .catch(function (error) {
                logs_1.default.info(["checkAllTeamMemberIds", error.message]);
                reject(error);
            });
        });
    }
    companydetail(companyId) {
        return new Promise(function (resolve, reject) {
            let condition = { "c.id": companyId, "cu.isCompanyOwner": 1 };
            let user = db("users AS u")
                .select("u.id As userId", "c.id As CompanyId", "u.email", " u.firstName", "u.lastName", " c.regionId", " r.regionName AS companyRegionName", " u.status", " u.role", "c.companyName", "c.companyAddress", "c.uniqueId", "c.onSiteSystemData")
                .join("company_users AS cu", "cu.userId", "u.id")
                .join("companies AS c", "cu.companyId", "c.id")
                .join("regions AS r", "r.id", "c.regionId")
                .where(condition)
                .then(function (data) {
                if (!(data && data.length)) {
                    reject(new Error("Company data not found"));
                }
                data = data[0];
                let responseData = {
                    customerUser: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                    },
                    companyInfo: {
                        companyName: data.companyName,
                        companyAddress: data.companyAddress,
                        uniqueId: data.uniqueId,
                        onSiteSystemData: data.onSiteSystemData,
                        regionId: data.regionId,
                        companyRegionName: data.companyRegionName,
                    },
                    assignedTeamMember: [],
                };
                db("users AS u")
                    .select("u.id As id", "atm.id As assignTeamMembersId", "u.email", " u.firstName", "u.lastName", "u.phoneNumber", "u.status", " u.role")
                    .join("assign_team_members AS atm", "atm.assignUserId", "u.id")
                    .where({ "atm.companyId": companyId, "u.role": constants_1.ENUM_User_ROLE.TEAM_MEMBER })
                    .then((assignedTeamMemberData) => {
                    responseData.assignedTeamMember = assignedTeamMemberData;
                    resolve(responseData);
                })
                    .catch((error) => {
                    reject(error);
                });
            })
                .catch(function (error) {
                logs_1.default.info(["checkAllTeamMemberIds", error.message]);
                reject(error);
            });
        });
    }
    isTeamMemberAssignToCompany(teamMemberId, companyId = undefined) {
        return new Promise(function (resolve, reject) {
            const whereObj = {
                assignUserId: teamMemberId,
            };
            if (companyId) {
                whereObj["companyId"] = companyId;
            }
            db("assign_team_members")
                .count({ count: "*" })
                .where(whereObj)
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve(false);
                }
                resolve(data[0]["count"] === 0 ? false : true);
            })
                .catch(function (error) {
                logs_1.default.info(["isTeamMemberAssignToCompany", error.message]);
                resolve(true);
            });
        });
    }
    isTeamMemberAssignToMultipleCompany(teamMemberId, companyId) {
        return new Promise(function (resolve, reject) {
            const whereObj = {
                assignUserId: teamMemberId,
            };
            db("assign_team_members")
                .count({ count: "*" })
                .where(whereObj)
                .whereIn("companyId", companyId)
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve(0);
                }
                resolve(data[0]["count"]);
            })
                .catch(function (error) {
                logs_1.default.info(["isTeamMemberAssignToCompany", error.message]);
                resolve(0);
            });
        });
    }
    isCompayUserAssignToCompany(userId, companyId) {
        return new Promise(function (resolve, reject) {
            db("company_users AS cu")
                .count({ count: "*" })
                .where({ userId: userId, companyId: companyId })
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve(false);
                }
                resolve(data[0]["count"] === 0 ? false : true);
            })
                .catch(function (error) {
                logs_1.default.info(["isCompayUserAssignToCompany", error.message]);
                resolve(false);
            });
        });
    }
    isCompayUserAssignToMultipleCompany(userId, companyId) {
        return new Promise(function (resolve, reject) {
            db("company_users AS cu")
                .count({ count: "*" })
                .where({ userId: userId })
                .whereIn("companyId", companyId)
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve(0);
                }
                resolve(data[0]["count"]);
            })
                .catch(function (error) {
                logs_1.default.info(["isCompayUserAssignToCompany", error.message]);
                resolve(0);
            });
        });
    }
    isCompanyNameUnique(companyName, companyId) {
        return new Promise(function (resolve, reject) {
            db("companies")
                .count({ count: "*" })
                .where({ companyName: companyName })
                .whereNot("id", companyId)
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve(false);
                }
                resolve(data[0]["count"] === 0 ? true : false);
            })
                .catch(function (error) {
                logs_1.default.info(["isCompanyNameUnique", error.message]);
                resolve(false);
            });
        });
    }
    isCompanyUniqueIdUnique(uniqueId, companyId) {
        return new Promise(function (resolve, reject) {
            db("companies")
                .count({ count: "*" })
                .where({ uniqueId: uniqueId })
                .whereNot("id", companyId)
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve(false);
                }
                resolve(data[0]["count"] === 0 ? true : false);
            })
                .catch(function (error) {
                logs_1.default.info(["isCompanyUniqueIdUnique", error.message]);
                resolve(false);
            });
        });
    }
    createCompanyUser(createdBy, companyId, data) {
        return new Promise(function (resolve, reject) {
            data.createdBy = createdBy;
            db("users")
                .insert(data)
                .then(function (data) {
                const userId = data[0];
                const company_users = {
                    userId: userId,
                    companyId: companyId,
                    isCompanyOwner: false,
                    createdBy: createdBy,
                };
                return db("company_users")
                    .insert(company_users)
                    .then((companyUsersData) => {
                    resolve(userId);
                })
                    .catch(function (error) {
                    reject({
                        error,
                        errNo: error.errno,
                        errMgs: error.message,
                        sqlMgs: error.sqlMessage,
                    });
                });
            })
                .catch(function (error) {
                reject({ error, errNo: error.errno, errMgs: error.message, sqlMgs: error.sqlMessage });
            });
        });
    }
    isCompanyIdExist(companyId) {
        return new Promise(function (resolve, reject) {
            db("companies")
                .select("id")
                .where({ id: companyId })
                .then(function (data) {
                if (!(data && data.length)) {
                    return reject("Company not found");
                }
                return resolve(true);
            })
                .catch(function (error) {
                logs_1.default.info(["isCompanyIdExist", error.message]);
                return reject("Company not found");
            });
        });
    }
    companyData(companyId) {
        return new Promise(function (resolve, reject) {
            db("companies AS c")
                .join("company_users AS cu", "cu.companyId", "c.id")
                .join("users AS u", "cu.userId", "u.id")
                .select("c.id AS companyId", "c.companyName AS companyName", "c.onSiteSystemData AS onSiteSystemData", "u.id AS userId", "u.status AS userStatus", "u.role AS userRole", "c.preS3KeyName AS preS3KeyName")
                .first()
                .where({ "c.id": companyId, isCompanyOwner: true })
                .then(function (data) {
                if (!data) {
                    return reject(new unProcessableError_1.default(message_1.default.COMPANY_NOT_FOUND));
                }
                return resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["companyData", error.message]);
                return reject(new unProcessableError_1.default(message_1.default.COMPANY_NOT_FOUND));
            });
        });
    }
    companyMultipleData(companyId) {
        return new Promise(function (resolve, reject) {
            db("companies AS c")
                .join("company_users AS cu", "cu.companyId", "c.id")
                .join("users AS u", "cu.userId", "u.id")
                .select("c.id AS companyId", "c.onSiteSystemData AS onSiteSystemData", "u.id AS userId", "u.status AS userStatus", "u.role AS userRole", "c.preS3KeyName AS preS3KeyName")
                .whereIn("c.id", companyId)
                .where({ isCompanyOwner: true })
                .then(function (data) {
                return resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["companyData", error.message]);
                return reject(new unProcessableError_1.default(message_1.default.COMPANY_NOT_FOUND));
            });
        });
    }
    getCompanyUsersList(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("users AS u")
                .join("company_users AS cu", "cu.userId", "u.id")
                .join("companies AS c", "cu.companyId", "c.id")
                .select("u.id As id", "c.id As companyId", "u.email", " u.firstName", "u.lastName", " u.status")
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .offset(data.pageLimit.offset)
                .catch(function (error) {
                logs_1.default.info(["getCompanyUsersList", error.message]);
                resolve(null);
            })
                .then(function (data) {
                resolve(data);
            });
        });
    }
    getCompanyUsersListCount(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("users AS u")
                .join("company_users AS cu", "cu.userId", "u.id")
                .join("companies AS c", "cu.companyId", "c.id")
                .where(db.raw(sql, sqlP));
            user.count({ count: "*" });
            user
                .then(function (data) {
                resolve(data[0].count);
            })
                .catch(function (error) {
                logs_1.default.info(["getCompanyUsersListCount", error.message]);
                resolve(0);
            });
        });
    }
    getCompanyUserDataFromUserId(userId) {
        return new Promise(function (resolve, reject) {
            db("company_users")
                .where("userId", userId)
                .first()
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getCompanyUserDataFromUserId", error.message]);
                reject(error);
            });
        });
    }
    getCompanyListFromTeammember(teamMemberId) {
        return new Promise(function (resolve, reject) {
            db("assign_team_members")
                .where({ assignUserId: teamMemberId })
                .then(function (data) {
                if (!(data && data.length)) {
                    resolve([]);
                }
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getCompanyListFromTeammember", error.message]);
                resolve([]);
            });
        });
    }
    updateCompanyStatus(companyId, status) {
        return db
            .transaction((trx) => {
            return db
                .raw("UPDATE `users` SET status = ? where id in (SELECT userId FROM `company_users` where companyId=?) AND role=?;", [status, companyId, constants_1.ENUM_User_ROLE.CUSTOMER_USER])
                .then((companyData) => __awaiter(this, void 0, void 0, function* () {
                return true;
            }))
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function (data) {
            return Promise.resolve(true);
        })
            .catch(function (error) {
            return Promise.reject({
                error,
                errNo: error.errno,
                errMgs: error.message,
                sqlMgs: error.sqlMessage,
            });
        });
    }
    getCompanyStatus(companyId) {
        return new Promise(function (resolve, reject) {
            db("users AS u")
                .select("u.status")
                .join("company_users AS cu", "cu.userId", "u.id")
                .join("companies AS c", "cu.companyId", "c.id")
                .first()
                .where({ "c.id": companyId, isCompanyOwner: true })
                .then(function (data) {
                if (!data) {
                    reject(new Error("Company data not found"));
                }
                resolve(data.status);
            })
                .catch(function (error) {
                logs_1.default.info(["getCompanyStatus", error.message]);
                reject(error);
            });
        });
    }
    updateOnSiteSystemData(companyId, companyObject, updatedBy) {
        return db
            .transaction((trx) => {
            return db("companies")
                .transacting(trx)
                .where({ id: companyId })
                .update(Object.assign(Object.assign({}, companyObject), { updatedBy: updatedBy }))
                .then((companyData) => {
                return companyData;
            })
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function (data) {
            return Promise.resolve(data);
        })
            .catch(function (error) {
            return Promise.reject({
                error,
                errNo: error.errno,
                errMgs: error.message,
                sqlMgs: error.sqlMessage,
            });
        });
    }
    updateOnPreSignedKey(companyId, companyObject, updatedBy) {
        return db
            .transaction((trx) => {
            return db("companies")
                .transacting(trx)
                .where({ id: companyId })
                .update(Object.assign(Object.assign({}, companyObject), { updatedBy: updatedBy }))
                .then((companyData) => {
                return companyData;
            })
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function (data) {
            return Promise.resolve(data);
        })
            .catch(function (error) {
            return Promise.reject({
                error,
                errNo: error.errno,
                errMgs: error.message,
                sqlMgs: error.sqlMessage,
            });
        });
    }
    getCompanyNameList(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("companies AS c")
                .join("company_users AS cu", "cu.companyId", "c.id")
                .join("users AS u", "cu.userId", "u.id")
                .select("c.id AS id", "c.companyName", "c.uniqueId")
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .offset(data.pageLimit.offset)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getCompanyList", error.message]);
                resolve(null);
            });
        });
    }
    //okay
    createDocument(companyId, documentData, createdBy) {
        return db
            .transaction((trx) => {
            documentData.companyId = companyId;
            documentData.createdBy = createdBy;
            documentData.createdAt = db.fn.now();
            db("documents")
                .transacting(trx)
                .insert(documentData)
                .then(function (resp) {
                const documentId = resp[0];
                return documentId;
            })
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function (data) {
            return data;
        })
            .catch(function (error) {
            return Promise.reject({
                error,
                errNo: error.errno,
                errMgs: error.message,
                sqlMgs: error.sqlMessage,
            });
        });
    }
    updateDocument(documentId, documentData, updatedBy) {
        return db
            .transaction((trx) => {
            let updateDoc = Object.assign(Object.assign({}, documentData), { updatedBy, updatedAt: db.fn.now() });
            return db("documents")
                .transacting(trx)
                .where({ id: documentId, isDeleted: false })
                .update(updateDoc)
                .then((updateData) => {
                return updateData;
            })
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function (data) {
            return data;
        })
            .catch(function (error) {
            return Promise.reject({
                error,
                errNo: error.errno,
                errMgs: error.message,
                sqlMgs: error.sqlMessage,
            });
        });
    }
    deleteDocument(documentId, updatedBy) {
        return db
            .transaction((trx) => {
            let updateDoc = { isDeleted: true, updatedBy, updatedAt: db.fn.now() };
            return db("documents")
                .transacting(trx)
                .where({ id: documentId })
                .update(updateDoc)
                .then((updateData) => {
                return updateData;
            })
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function (data) {
            return data;
        })
            .catch(function (error) {
            return Promise.reject({
                error,
                errNo: error.errno,
                errMgs: error.message,
                sqlMgs: error.sqlMessage,
            });
        });
    }
    updateDocPermission(documentId, updateDocPermissionObj, updatedBy) {
        return db
            .transaction((trx) => {
            let updateDocPermission = Object.assign(Object.assign({}, updateDocPermissionObj), { updatedBy, updatedAt: db.fn.now() });
            return db("documents")
                .transacting(trx)
                .where({ id: documentId })
                .update(updateDocPermission)
                .then((updateData) => {
                return updateData;
            })
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function (data) {
            return Promise.resolve(data);
        })
            .catch(function (error) {
            return Promise.reject({
                error,
                errNo: error.errno,
                errMgs: error.message,
                sqlMgs: error.sqlMessage,
            });
        });
    }
    getDocumentDetail(documentId) {
        return new Promise(function (resolve, reject) {
            let user = db("documents")
                .where({ id: documentId })
                .then(function (data) {
                resolve(data[0]);
            })
                .catch(function (error) {
                logs_1.default.info(["getDocumentListCount", error.message]);
                reject(new Error("document not found"));
            });
        });
    }
    isDocumentAssignToCompany(documentId, companyId) {
        return new Promise(function (resolve, reject) {
            db("users AS u")
                .select("u.id As userId", "u.role As userRole", "u.status AS companyStatus", " d.id AS documentId", "d.companyId", "d.documentFormat", " d.documentsizeInByte", "d.permissionSuperAdmin", "d.permissionAdmin", " d.permissionTeamMember", "d.permissionCustomerUser", "d.documentName", "d.documentType", "d.isDeleted AS documentStatus", "d.documentKeyName AS documentKeyName", "dt.documentTypeName", "c.companyName")
                .join("company_users AS cu", "cu.userId", "u.id")
                .join("companies AS c", "cu.companyId", "c.id")
                .join("documents AS d", "d.companyId", "c.id")
                .join("document_types AS dt", "dt.id", "d.documentType")
                .first()
                .where({ "c.id": companyId, "cu.isCompanyOwner": true, "d.id": documentId })
                .then(function (data) {
                if (!data) {
                    return reject(new Error(message_1.default.DOCUMENT_NOT_ASSIGN_TO_COMPANY));
                }
                return resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["isDocumentAssignToCompany", error.message]);
                return reject(new Error(message_1.default.DOCUMENT_NOT_ASSIGN_TO_COMPANY));
            });
        });
    }
    getCustomerFetchList(sql, sqlP, data) {
        return new Promise(function (resolve) {
            let user = db("companies AS c")
                .select("c.id AS companyId", "c.companyName")
                .where(db.raw(sql, sqlP))
                .orderBy(data.sortObject.column, data.sortObject.order)
                .limit(data.pageLimit.limit)
                .offset(data.pageLimit.offset)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getCustomerFetchList", error.message]);
                resolve(null);
            });
        });
    }
    getMultipleDocuments(documentIds) {
        return new Promise(function (resolve, reject) {
            db("documents AS d")
                .join("companies AS c", "d.companyId", "c.id")
                .select("d.companyId", "d.documentKeyName", "d.permissionSuperAdmin", "d.permissionAdmin", "d.permissionTeamMember", "d.permissionCustomerUser", "c.preS3KeyName", "d.id AS documentId", "d.documentName")
                .whereIn("d.id", documentIds)
                .then(function (data) {
                return resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["getMultipleDocuments", error.message]);
                return resolve([]);
            });
        });
    }
    companyMetaData(companyId) {
        return new Promise(function (resolve, reject) {
            db("companies AS c")
                .join("regions AS r", "c.regionId", "r.id")
                .join("company_users AS cu", "cu.companyId", "c.id")
                .join("users AS u", "cu.userId", "u.id")
                .leftJoin("users AS cby", "cby.id", "c.createdBy")
                .leftJoin("users AS uby", "uby.id", "c.updatedBy")
                .select("u.firstName", "u.lastName", "c.companyName", "c.companyAddress", "c.uniqueId", "u.email", "c.CreatedAt As companyCreatedAt", "c.UpdatedAt As companyUpdatedAt", "r.regionName AS companyRegionName", "cby.id As createdUserId", db.raw(`CONCAT_WS(" ", cby.firstName, cby.lastName) AS createdFullName`), "uby.id As updatedUserId", db.raw(`CONCAT_WS(" ", uby.firstName, uby.lastName) AS updatedFullName`))
                .first()
                .where({ "c.id": companyId, isCompanyOwner: true })
                .then(function (data) {
                if (!data) {
                    return reject(new unProcessableError_1.default(message_1.default.COMPANY_NOT_FOUND));
                }
                return resolve(data);
            })
                .catch(function (error) {
                logs_1.default.info(["companyData", error.message]);
                return reject(new unProcessableError_1.default(message_1.default.COMPANY_NOT_FOUND));
            });
        });
    }
    companyAssignTeamMemberMetaList(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve, reject) {
                db("users AS u")
                    .select("u.id As id", "atm.id As assignTeamMembersId", "u.email", " u.firstName", "u.lastName", "u.phoneNumber", "u.status", " u.role")
                    .join("assign_team_members AS atm", "atm.assignUserId", "u.id")
                    .where({ "atm.companyId": companyId, "u.role": constants_1.ENUM_User_ROLE.TEAM_MEMBER })
                    .then((assignedTeamMemberData) => {
                    resolve(assignedTeamMemberData);
                })
                    .catch((error) => {
                    reject(error);
                });
            });
        });
    }
}
exports.default = new UserRepo();
