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
describe("Auth Suit (POST /auth/login)", () => {
    describe("Logged in from Superadmin", () => {
        it("Correct credentails, superadmin@yopmail.com, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.superAdmin.credentails);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("accessToken");
            chai_1.expect(result.body.data).to.have.property("refreshToken");
            chai_1.expect(result.body.data).to.have.property("user");
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.SUPERADMIN);
        }));
        it("Correct credentails , httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.superAdmin.credentails);
            chai_1.expect(result.body.data).to.have.property("accessToken");
            chai_1.expect(result.body.data).to.have.property("refreshToken");
            chai_1.expect(result.body.data).to.have.property("user");
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.SUPERADMIN);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("login with de-active user - Superadmin -- httpcode: #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.deactiveSuperadmin.credentails);
            chai_1.expect(result.body.message).to.equal("Your account is deactivated, please contact super admin.");
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("email field not send - httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send({ password: "sdfsadf" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("password field not send - httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send({ email: "sdfsadf" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("In-correct credentails - httpcode #401", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send({ email: "testing@hello.com", password: "sdfsadf" });
            chai_1.expect(result.statusCode).to.equal(401);
        }));
        it("In-correct credentails if email address exist in db - httpcode #401", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateDate = Object.assign({}, helper_1.roleLoginCredentails.superAdmin.credentails);
            updateDate.password = "sdfsadf";
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(updateDate);
            chai_1.expect(result.statusCode).to.equal(401);
        }));
        it("settemporarypassword user try to login - Superadmin -- httpcode: #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.settemporarypasswordSuperadmin.credentails);
            chai_1.expect(result.body.data).to.have.property("accessToken");
            chai_1.expect(result.body.data).to.have.property("refreshToken");
            chai_1.expect(result.body.data).to.have.property("user");
            chai_1.expect(result.body.data.user.setTemporaryPassword).to.equal(1);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
    });
    describe("Logged in from admin", () => {
        it("Correct credentails, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.admin.credentails);
            chai_1.expect(result.body.data).to.have.property("accessToken");
            chai_1.expect(result.body.data).to.have.property("refreshToken");
            chai_1.expect(result.body.data).to.have.property("user");
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.ADMIN);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("login with de-active user - admin -- httpcode: #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.deactiveAdmin.credentails);
            chai_1.expect(result.body.message).to.equal("Your account is deactivated, please contact super admin.");
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from teammember", () => {
        it("Correct credentails, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.teamMember.credentails);
            chai_1.expect(result.body.data).to.have.property("accessToken");
            chai_1.expect(result.body.data).to.have.property("refreshToken");
            chai_1.expect(result.body.data).to.have.property("user");
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.TEAM_MEMBER);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("login with de-active user - admin -- httpcode: #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.deactiveTeamMember.credentails);
            chai_1.expect(result.body.message).to.equal("Your account is deactivated, please contact super admin.");
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from customer", () => {
        it("Correct credentails, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.customer.credentails);
            chai_1.expect(result.body.data).to.have.property("accessToken");
            chai_1.expect(result.body.data).to.have.property("refreshToken");
            chai_1.expect(result.body.data).to.have.property("user");
            chai_1.expect(result.body.data.user.role).to.equal(constants_1.ENUM_User_ROLE.CUSTOMER_USER);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("login with de-active user- httpcode: #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .post("/auth/login")
                .set("user-agent", "mocha")
                .send(helper_1.roleLoginCredentails.deactiveCustomerUser.credentails);
            chai_1.expect(result.body.message).to.equal("Your account is deactivated, please contact super admin.");
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
