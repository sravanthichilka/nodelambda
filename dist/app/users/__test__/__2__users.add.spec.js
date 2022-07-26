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
let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
const addNewUser = {
    firstName: "add_new_user_fn",
    lastName: "add_new_user_ln",
    email: "add_new_user@yopmail.com",
    temporaryPassword: helper_1.commonPassword,
    role: 1,
};
describe("Users Suit (POST /users)", () => {
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
        it("add user with role superadmin, httpcode #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addSuperAdminRoleBySuperAdmin.role;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("add user with role superadmin, send regionId, phonenumber,  httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addSuperAdminRoleBySuperAdmin.role;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add user with role admin, httpcode #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addAdminRoleBySuperAdmin.role;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("add user with role team, httpcode #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addTeamRoleBySuperAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addTeamRoleBySuperAdmin.role;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("add user with role teammember, without regionId,phoneNumber , httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addTeamRoleBySuperAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addTeamRoleBySuperAdmin.role;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("dont send field, superadmin@yopmail.com, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("add user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_s@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_a@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.ADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role team, without regionId,phoneNumber , httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addTeamRoleByAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addTeamRoleByAdmin.role;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("add user with role teammember, with regionId,phoneNumber httpcode #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addTeamRoleByAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addTeamRoleByAdmin.role;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(201);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("add user with role customer, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_customer@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.CUSTOMER_USER;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("dont send field, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("add user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_s@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_a@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.ADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role team, with regionId,phoneNumber , httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addAdminRoleBySuperAdmin.role;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role teammember, with regionId,phoneNumber httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addTeamRoleByAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addTeamRoleByAdmin.role;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role customer, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_customer@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.CUSTOMER_USER;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("dont send field, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from customer", () => {
        it("add user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_s@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role admin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_a@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.ADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role team, with regionId,phoneNumber , httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addAdminRoleBySuperAdmin.role;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role teammember, with regionId,phoneNumber httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = helper_1.addUserWithRole.addTeamRoleByAdmin.credentails.email;
            addNewUserClone.role = helper_1.addUserWithRole.addTeamRoleByAdmin.role;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("add user with role customer, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_customer@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.CUSTOMER_USER;
            addNewUserClone.regionId = 1;
            addNewUserClone.phoneNumber = "9823456789";
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("dont send field, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
                .send({});
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from admin, update superadmin record", () => {
        it("admin ->  superadmin , add user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const admin1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_superadmin@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", admin1.accessToken)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from teammember, update admin record", () => {
        it("teammember ->  admin , add user with role superadmin, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const teamMember1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            const admin1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.admin.credentails);
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_superadmin@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", teamMember1.accessToken)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("CROSS:IN: Logged in from customer, update teammember record", () => {
        it("customer ->  teammember , httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const teamMember1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.teamMember.credentails);
            const customer1 = yield helper_1.getLoginDataFn(helper_1.roleLoginCredentails.customer.credentails);
            const addNewUserClone = Object.assign({}, addNewUser);
            addNewUserClone.email = "add_user_a_superadmin@yopmail.com";
            addNewUserClone.role = constants_1.ENUM_User_ROLE.SUPERADMIN;
            const result = yield supertest_1.default(main_1.default)
                .post("/users")
                .set("user-agent", "mocha")
                .set("Authorization", customer1.accessToken)
                .send(addNewUserClone);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
