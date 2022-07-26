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
const main_1 = __importDefault(require("../../../main"));
const supertest_1 = __importDefault(require("supertest"));
const chai_1 = require("chai");
const constants_1 = require("../../../helper/constants");
const helper_1 = require("../../customers/__test__/helper");
const users_repo_1 = __importDefault(require("../../users/users.repo"));
let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
const updateAUser = {
    firstName: "update_ns",
    lastName: "ns",
};
// update_user_s_s@yopmail.com
// update_user_s_a@yopmail.com
//   update_user_a_team@yopmail.com
describe("Users Suit (POST /users/:userId)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const superAdmin = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            SUPERADMIN_ACCESS_TOKEN = superAdmin.accessToken;
            SUPERADMIN_REFRESH_ACCESS_TOKEN = superAdmin.refreshToken;
            const admin = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            ADMIN_ACCESS_TOKEN = admin.accessToken;
            ADMIN_REFRESH_ACCESS_TOKEN = admin.refreshToken;
            const teammember = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            TEAMMEMBER_ACCESS_TOKEN = teammember.accessToken;
            TEAMMEMBER_REFRESH_ACCESS_TOKEN = teammember.refreshToken;
            const customeruser = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.customer.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = customeruser.accessToken;
            CUSTOMER_USER_REFRESH_ACCESS_TOKEN = customeruser.refreshToken;
        });
    });
    describe("Logged in from Superadmin", () => {
        it("update user with role superadmin, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
            addUpdateUserClone.role = helper_1.updateUserWithRole.addSuperAdminRoleBySuperAdmin.role;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + userId)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update user role superadmin, with email,  httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + userId)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("update user with role admin, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addAdminRoleBySuperAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
            addUpdateUserClone.role = helper_1.updateUserWithRole.addAdminRoleBySuperAdmin.role;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + userId)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update user role admin, with email,  httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addAdminRoleBySuperAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + userId)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("update user with role teammember, without regionId, phonenumber,  httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addTeamRoleBySuperAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addTeamRoleBySuperAdmin.credentails.email;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + userId)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update user with role teammember, with regionId, phonenumber,  httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addTeamRoleBySuperAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addTeamRoleBySuperAdmin.credentails.email;
            addUpdateUserClone.regionId = 1;
            addUpdateUserClone.phoneNumber = "9823456788";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + userId)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("dont send field, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("update user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + userId)
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update user with role teammember, with regionId, phonenumber,  httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.addUserWithRole.addTeamRoleByAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const teamId = user.id;
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email= updateUserWithRole.addTeamRoleByAdmin.credentails.email;
            addUpdateUserClone.regionId = 1;
            addUpdateUserClone.phoneNumber = "9823451234";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + teamId)
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("dont send field, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("update user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_s_s@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/13")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update user with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_s_s@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.ADMIN;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/13")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update user with role teammember, with regionId, phonenumber,  httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_a_team@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.TEAM_MEMBER;
            addUpdateUserClone.regionId = 1;
            addUpdateUserClone.phoneNumber = "9823451234";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update user with role teammember, without regionId, phonenumber,  httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_a_team@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.TEAM_MEMBER;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("dont send field, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from customer", () => {
        it("update user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_s_s@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/13")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update user with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_s_s@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.ADMIN;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/13")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update user with role teammember, with regionId, phonenumber,  httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_a_team@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.TEAM_MEMBER;
            addUpdateUserClone.regionId = 1;
            addUpdateUserClone.phoneNumber = "9823451234";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update user with role teammember, without regionId, phonenumber,  httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="update_user_a_team@yopmail.com";
            addUpdateUserClone.role = constants_1.ENUM_User_ROLE.TEAM_MEMBER;
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("dont send field, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .put("/users/26")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from admin, update superadmin record", () => {
        it("admin ->  superadmin , update user superadmin@yopmail.com with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.superAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const superAdminId = user.id;
            const admin1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + superAdminId)
                .set("user-agent", "mocha")
                .set("Authorization", admin1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("admin ->  superadmin , update user superadmin@yopmail.com with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.superAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const superAdminId = user.id;
            const admin1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + superAdminId)
                .set("user-agent", "mocha")
                .set("Authorization", admin1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from teammember, update admin record", () => {
        it("teammember ->  supeadmin , update user admin@yopmail.com with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.admin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const teamMember1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + adminId)
                .set("user-agent", "mocha")
                .set("Authorization", teamMember1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("teammember ->  admin , update user admin@yopmail.com with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.admin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const teamMember1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + adminId)
                .set("user-agent", "mocha")
                .set("Authorization", teamMember1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("teammember ->  teammember , update user teammember@yopmail.com with role teammember, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.teamMember.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const teamMember1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + adminId)
                .set("user-agent", "mocha")
                .set("Authorization", teamMember1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from customer, update teammember record", () => {
        it("customer ->  superadmin , update user customer@yopmail.com with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.admin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const customer1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.customer.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + adminId)
                .set("user-agent", "mocha")
                .set("Authorization", customer1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("customer ->  admin , update user admin@yopmail.com with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.admin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const customer1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.customer.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + adminId)
                .set("user-agent", "mocha")
                .set("Authorization", customer1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("customer ->  teammember , update user teammember@yopmail.com with role teammember, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.teamMember.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const customer1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.customer.credentails);
            const addUpdateUserClone = Object.assign({}, updateAUser);
            // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .put("/users/" + adminId)
                .set("user-agent", "mocha")
                .set("Authorization", customer1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
