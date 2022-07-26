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
const helper_1 = require("../../customers/__test__/helper");
let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN_OTHER = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN_OTHER = "";
describe("Customer Suit (GET /customers/:companyId)", () => {
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
            const customeruserOther = yield helper_1.getLoginDataFn(helper_1.addCustomerUser.addBySuperAdmin.credentails);
            CUSTOMER_USER_ACCESS_TOKEN_OTHER = customeruserOther.accessToken;
            CUSTOMER_USER_REFRESH_ACCESS_TOKEN_OTHER = customeruserOther.refreshToken;
        });
    });
    describe("Logged in from Superadmin", () => {
        it("accessing by superadmin role,  httpcode 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("customerUser");
            chai_1.expect(result.body.data).to.have.property("companyInfo");
            chai_1.expect(result.body.data).to.have.property("assignedTeamMember");
        }));
        it("sending wrong companyId by superadmin role,  httpcode 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1122")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("accessing by role,  httpcode 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("customerUser");
            chai_1.expect(result.body.data).to.have.property("companyInfo");
            chai_1.expect(result.body.data).to.have.property("assignedTeamMember");
        }));
        it("sending wrong companyId by role,  httpcode 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1122")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("accessing by  teammember customer #1,  httpcode 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("accessing by teammember customer #9,  httpcode 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/9")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("customerUser");
            chai_1.expect(result.body.data).to.have.property("companyInfo");
            chai_1.expect(result.body.data).to.have.property("assignedTeamMember");
        }));
        it("sending wrong companyId by role,  httpcode 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1122")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from customer", () => {
        it("accessing by role,  httpcode 200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("customerUser");
            chai_1.expect(result.body.data).to.have.property("companyInfo");
            chai_1.expect(result.body.data).to.have.property("assignedTeamMember");
        }));
        it("accessing by customer user to company #1 role,  httpcode 403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN_OTHER);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("sending wrong companyId by role,  httpcode 422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1122")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
});
