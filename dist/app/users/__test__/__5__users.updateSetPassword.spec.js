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
const updateUserStatus = {
    setTemporaryPassword: helper_1.commonPassword,
};
describe("Users Suit  (PATCH /users/:userId/setTemporaryPassword)", () => {
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
        it("update status user inactive #13 , httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = { status: constants_1.ENUM_User_Status.INACTIVE };
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/13/status")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("update status user active #13 , httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = { status: constants_1.ENUM_User_Status.ACTIVE };
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/13/status")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("update status user  #13 , httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const addUpdateUserClone = Object.assign({}, updateUserStatus);
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/13/setTemporaryPassword")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("update status user  #13, add_user_s_team@yopmail.com pending status , httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: "add_user_s_team@yopmail.com" };
            const user = yield users_repo_1.default.searchUser(condition);
            const userId = user.id;
            const addUpdateUserClone = Object.assign({}, updateUserStatus);
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/" + userId + "/setTemporaryPassword")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
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
    describe("CROSS:IN: Logged in from admin, update superadmin record", () => {
        it("admin ->  superadmin , update user superadmin@yopmail.com with inactive, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.superAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const superAdminId = user.id;
            const admin1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            const addUpdateUserClone = Object.assign({}, updateUserStatus);
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/" + superAdminId + "/setTemporaryPassword")
                .set("user-agent", "mocha")
                .set("Authorization", admin1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("admin ->  admin , update user superadmin@yopmail.com with active, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.deactiveAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const AdminId = user.id;
            const admin1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            const addUpdateUserClone = Object.assign({}, updateUserStatus);
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/" + AdminId + "/setTemporaryPassword")
                .set("user-agent", "mocha")
                .set("Authorization", admin1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from teammember, update admin record", () => {
        it("teammember ->  supeadmin , update user admin@yopmail.com with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.superAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const teamMember1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            const addUpdateUserClone = Object.assign({}, updateUserStatus);
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/" + adminId + "/setTemporaryPassword")
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
            const addUpdateUserClone = Object.assign({}, updateUserStatus);
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/" + adminId + "/setTemporaryPassword")
                .set("user-agent", "mocha")
                .set("Authorization", teamMember1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from customer, update teammember record", () => {
        it("customer ->  superadmin , update user customer@yopmail.com with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const condition = { email: helper_1.roleLoginCredentails.superAdmin.credentails.email };
            const user = yield users_repo_1.default.searchUser(condition);
            const adminId = user.id;
            const customer1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.customer.credentails);
            const addUpdateUserClone = Object.assign({}, updateUserStatus);
            const result = yield supertest_1.default(main_1.default)
                .patch("/users/" + adminId + "/setTemporaryPassword")
                .set("user-agent", "mocha")
                .set("Authorization", customer1.accessToken)
                .send(addUpdateUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
