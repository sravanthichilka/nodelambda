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
const helper_1 = require("./helper");
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
const addCustomerUserData = {
    firstName: "ns",
    lastName: "ns",
    email: "new_cu1@yopmail.com",
    temporaryPassword: helper_1.commonPassword,
};
describe("Add CustomerUser Suit POST /customers/:companyId/users", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("Add customer user in company id #1 by superadmin", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
        }));
        it("Duplicate customer user adding by company id #1 by superadmin, http code #409", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("Add customer user in not exist companyId #1234 by superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1234/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("Not send email field in add customer user companyId #1 by superadmin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1234/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("Add customer user in company id #1 by admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_admin_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
        }));
        it("Add customer user in not exist companyId #1234 by admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1234/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("Not send email field in add customer user companyId #1 by admin, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1234/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("Add customer user in company id #1, not linked with company by teammember, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("Add customer user in company id #1, linked with company #2 by teammember, http code #201", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_tm_cu2@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/2/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(201);
        }));
        it("Add customer user in not exist companyId #1234 by teamMember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1234/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("Not send email field in add customer user companyId #1 by teamMember, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1234/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("Add customer user in company id #1 by teamMember, not link with company #1, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.lastName = "new_cu1";
            addCustomerUserDataCopy.email = "new_tm_cu1@yopmail.com";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
    describe("Logged in from customer", () => {
        it("Add customer user in company id #1 by customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            let addCustomerUserDataCopy = Object.assign({}, addCustomerUserData);
            addCustomerUserDataCopy.lastName = "new_cu1";
            const result = yield supertest_1.default(main_1.default)
                .post("/customers/1234/users")
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(addCustomerUserDataCopy);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
