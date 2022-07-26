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
const helper_1 = require("./helper");
const updateCustomerUserData = {
    status: constants_1.ENUM_User_Status.INACTIVE,
};
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds = [];
let company_2_UserListIds = [];
describe("Update Customer User STATUS Suit (PATCH /customers/:companyId/users/:userId/status)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
            company_1_UserListIds = yield helper_1.getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 1);
            company_2_UserListIds = yield helper_1.getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 2);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("change user status inactive of company id #1 by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("again change user status inactive of company id #1 by superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("send invalid field , logged in superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("company does not exist, logged in superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/123423/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update customer user in wrong companyId, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from admin", () => {
        it("change user status  active of company id #1 by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.ACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("again change user status active of company id #1 by admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.ACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("send invalid field , logged in admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("company does not exist, logged in admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/123423/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update customer user in wrong companyId by admin, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from teammember", () => {
        it("change user status  inactive of company id #1, not link with company#1 by teammember, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.INACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("change user status  inactive of link with company#2 by teammember, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const userId = company_2_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.INACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("again change user status inactive of company id #2 by teammember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const userId = company_2_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.INACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("change user status active of company id #2 by teammember, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const userId = company_2_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.ACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("send invalid field , logged in teammember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("company does not exist, logged in teammember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/123423/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update customer user in wrong companyId by teammember, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from customeruser", () => {
        it("change user status  inactive of company id #1, not link with company#1 by customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.INACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("change user status  inactive of link with company#2 by customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const userId = company_2_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.INACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("again change user status inactive of company id #2 by customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const userId = company_2_UserListIds[0];
            updateCustomerUserData.status = constants_1.ENUM_User_Status.INACTIVE;
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("send invalid field , logged in customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/1/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("company does not exist, logged in customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/123423/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ firstName1: "test" });
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("update customer user in wrong companyId by customeruser, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const userId = company_1_UserListIds[0];
            const result = yield supertest_1.default(main_1.default)
                .patch(`/customers/2/users/${userId}/status`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateCustomerUserData);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
