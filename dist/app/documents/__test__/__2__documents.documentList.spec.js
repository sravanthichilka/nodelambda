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
let company_1_UserListIds = [];
let company_2_UserListIds = [];
describe("Document List Suit (POST /documents?companyId=1&filter[documentName]=BIRKO_LOGOjpg&filter[documentType]=1&sortBy[documentTypeName]=asc)", () => {
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
        it("document list, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company Id #1,  httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("onSiteSystemData");
        }));
        it("document list with filter[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentName]=birk`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with filter[documentType], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentType]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with sortBy[documentTypeName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentTypeName]=asc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with sortBy[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentName]=desc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with invalid sortBy[documentName1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentName1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("document list with invalid filter[documentType1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentType1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from Admin", () => {
        it("document list, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company Id #1,  httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("onSiteSystemData");
        }));
        it("document list with filter[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentName]=birk`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with filter[documentType], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentType]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with sortBy[documentTypeName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentTypeName]=asc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with sortBy[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentName]=desc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list with invalid sortBy[documentName1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentName1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("document list with invalid filter[documentType1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentType1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from TeamMember", () => {
        it("document list, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#1,  httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("document list, company#1 with filter[documentName], httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=1&filter[documentName]=birk`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("document list, company#2 httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("onSiteSystemData");
        }));
        it("document list, company#2 with filter[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2&filter[documentName]=birk`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#2 with filter[documentType], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2&filter[documentType]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#2 with sortBy[documentTypeName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2&sortBy[documentTypeName]=asc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#2 with sortBy[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2&sortBy[documentName]=desc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#2 with invalid sortBy[documentName1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2&sortBy[documentName1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("document list, company#2 with invalid filter[documentType1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2&filter[documentType1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from CustomerUser", () => {
        it("document list, company#2 httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("document list, company#2 with filter[documentName], httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?companyId=2&filter[documentName]=birk`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("document list, company#1 httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#1 with filter[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentName]=birk`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#1 with filter[documentType], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentType]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#1 with sortBy[documentTypeName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentTypeName]=asc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#1 with sortBy[documentName], httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentName]=desc`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("document list, company#1 with invalid sortBy[documentName1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?sortBy[documentName1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("document list, company#1 with invalid filter[documentType1], httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .get(`/documents?filter[documentType1]=1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
});
