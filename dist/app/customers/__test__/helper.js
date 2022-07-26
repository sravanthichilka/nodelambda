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
exports.addCustomerUser = exports.getTeamUserIdsFn = exports.getCompanyIdsFn = exports.updateUserWithRole = exports.addUserWithRole = exports.getLoginDataFn = exports.getLoginRefreshAccessTokenFn = exports.getUserIdsFromCompanyFn = exports.getLoginAccessTokenFn = exports.commonPassword = exports.roleLoginCredentails = void 0;
const constants_1 = require("../../../helper/constants");
const main_1 = __importDefault(require("../../../main"));
const supertest_1 = __importDefault(require("supertest"));
const commonPassword = "Birko@123";
exports.commonPassword = commonPassword;
const roleLoginCredentails = {
    superAdmin: {
        credentails: {
            email: "superadmin@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN,
    },
    admin: {
        credentails: {
            email: "admin@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.ADMIN,
    },
    teamMember: {
        credentails: {
            email: "teammember@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    },
    customer: {
        credentails: {
            email: "customer@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.CUSTOMER_USER,
    },
    deactiveSuperadmin: {
        credentails: {
            email: "deactive_superadmin@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN,
    },
    activeSuperadmindeactiveAfterForgotPassword: {
        credentails: {
            email: "active_superadmin_deactive_afterforgotpassword@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN,
    },
    deactiveAdmin: {
        credentails: {
            email: "deactive_admin@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.ADMIN,
    },
    deactiveTeamMember: {
        credentails: {
            email: "deactive_teammember@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    },
    deactiveCustomerUser: {
        credentails: {
            email: "deactive_customeruser@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    },
    settemporarypasswordSuperadmin: {
        credentails: {
            email: "settemporarypassword_superadmin@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN,
    },
};
exports.roleLoginCredentails = roleLoginCredentails;
const addUserWithRole = {
    addSuperAdminRoleBySuperAdmin: {
        credentails: {
            email: "add_user_s_s@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN,
    },
    addAdminRoleBySuperAdmin: {
        credentails: {
            email: "add_user_s_a@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.ADMIN,
    },
    addTeamRoleBySuperAdmin: {
        credentails: {
            email: "add_user_s_team@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    },
    addTeamRoleByAdmin: {
        credentails: {
            email: "add_user_a_team@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    },
};
exports.addUserWithRole = addUserWithRole;
const updateUserWithRole = {
    addSuperAdminRoleBySuperAdmin: {
        credentails: {
            email: "update_user_s_s@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.SUPERADMIN,
    },
    addAdminRoleBySuperAdmin: {
        credentails: {
            email: "update_user_s_a@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.ADMIN,
    },
    addTeamRoleBySuperAdmin: {
        credentails: {
            email: "update_user_s_team@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    },
    addTeamRoleByAdmin: {
        credentails: {
            email: "update_user_a_team@yopmail.com",
            password: commonPassword,
        },
        role: constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    },
};
exports.updateUserWithRole = updateUserWithRole;
const addCustomerUser = {
    addBySuperAdmin: {
        credentails: {
            email: "pri_add_custuser_s@yopmail.com",
            password: "test",
        },
    },
};
exports.addCustomerUser = addCustomerUser;
const getLoginAccessTokenFn = (credentails) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supertest_1.default(main_1.default)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(credentails);
    return result.body.data.accessToken;
});
exports.getLoginAccessTokenFn = getLoginAccessTokenFn;
const getLoginRefreshAccessTokenFn = (credentails) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supertest_1.default(main_1.default)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(credentails);
    return result.body.data.refreshToken;
});
exports.getLoginRefreshAccessTokenFn = getLoginRefreshAccessTokenFn;
const getLoginDataFn = (credentails) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield supertest_1.default(main_1.default)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(credentails);
    return { accessToken: result.body.data.accessToken, refreshToken: result.body.data.refreshToken };
});
exports.getLoginDataFn = getLoginDataFn;
const getUserIdsFromCompanyFn = (accessToken, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield supertest_1.default(main_1.default)
        .get(`/customers/${companyId}/users`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
    const userList = [];
    response.body.data.records.map((rec) => {
        userList.push(rec.id);
    });
    return userList;
});
exports.getUserIdsFromCompanyFn = getUserIdsFromCompanyFn;
const getCompanyIdsFn = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield supertest_1.default(main_1.default)
        .get(`/customers/fetch`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
    const userList = [];
    response.body.data.records.map((rec) => {
        userList.push(rec.companyId);
    });
    return userList;
});
exports.getCompanyIdsFn = getCompanyIdsFn;
const getTeamUserIdsFn = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield supertest_1.default(main_1.default)
        .get(`/teammembers/fetch`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
    const userList = [];
    response.body.data.records.map((rec) => {
        userList.push(rec.id);
    });
    return userList;
});
exports.getTeamUserIdsFn = getTeamUserIdsFn;
