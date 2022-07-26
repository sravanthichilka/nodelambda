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
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
describe("move Document Suit (POST /customers/:companyId/documents/:documentId/getCustomersForMoveDocument?filter[nameOrUniqueId]=appit_9)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("without search by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("without search by superadmin, invalid company #123123, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("with search filter by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("invalid field name, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("without search by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("without search by admin, invalid company #123123, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("with search filter by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("invalid field name, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("without search by teammember, not link customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("without search by teammember, invalid company #123123, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("with search filter by teammember, link http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/2/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("with search filter by teammember, not link http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("invalid field name, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/2/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from customer", () => {
        it("without search by customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("without search by teammember, invalid company #123123, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("with search filter by customer, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("invalid field name, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
