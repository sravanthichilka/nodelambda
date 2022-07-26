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
const updateDocument = {
    documentType: 1,
    documentName: "update_birko_logo",
};
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
describe("move Document Suit (PUT /:companyId/documents/:documentId)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
        });
    });
    describe("Logged in from Superadmin", () => {
        it("update document, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("update document, wrong document ID #12323, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/12323`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update document, deleted document ID #2, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/12323`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update document, invalid company #123123, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/123123/documents/1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update document type #2, by superadmin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const updateDocData = Object.assign({}, updateDocument);
            updateDocData.documentType = 2;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("invalid field name, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = SUPERADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/1?filter1[nameOrUniqueId1]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ updateDocument: "updatedocument" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("update document, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("update document, wrong document ID #12323, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/12323`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update document, deleted document ID #2, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/12323`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update document, invalid company #123123, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/123123/documents/1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("update document type #2, by admin, http code #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const updateDocData = Object.assign({}, updateDocument);
            updateDocData.documentType = 2;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocData);
            chai_1.expect(result.statusCode).to.equal(200);
        }));
        it("invalid field name, http code #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = ADMIN_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/1?filter1[nameOrUniqueId1]=app`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send({ updateDocument: "updatedocument" });
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("update document, not link company #1, document #1, http code #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = TEAMMEMBER_ACCESS_TOKEN;
            const result = yield supertest_1.default(main_1.default)
                .put(`/customers/1/documents/1`)
                .set("user-agent", "mocha")
                .set("Authorization", accessToken)
                .send(updateDocument);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
