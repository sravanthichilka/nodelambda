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
const addCustomerData = {
    customerUser: {
        firstName: "test",
        lastName: "test",
        email: "tes11t12221@gmail.com",
        temporaryPassword: "test",
        regionId: 2,
    },
    companyInfo: {
        companyName: "test222111",
        companyAddress: "test",
        uniqueId: "test11221",
    },
    assignedTeamMember: [1],
};
describe("Customer Suit (GET /customers) ", () => {
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
        it("customer list, superadmin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("filter customer list by company name or uniqueId, superadmin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique]=" + "cnamesuperadmin")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid filter firstLastAndUnique  sending customer list, superadmin, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("filter customer list by regionId, superadmin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid filter regionId  sending customer list, superadmin, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId1]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
        // "companyName", "uniqueId", "firstName","lastName","email", "status"
        it("sort customer list superadmin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid sort companyName1 customer list superadmin, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName1]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from admin", () => {
        it("customer list, admin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("filter customer list by company name or uniqueId, admin, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique]=" + "cnameadmin")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid filter firstLastAndUnique  sending customer list, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("filter customer list by regionId, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid filter regionId  sending customer list, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId1]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
        // "companyName", "uniqueId", "firstName","lastName","email", "status"
        it("sort customer list, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid sort companyName1 customer list, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName1]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", ADMIN_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from teammember", () => {
        it("customer list, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("filter customer list by company name or uniqueId, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique]=" + "cnameadmin")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid filter firstLastAndUnique  sending customer list, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        it("filter customer list by regionId, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid filter regionId  sending customer list, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId1]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
        //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
        // "companyName", "uniqueId", "firstName","lastName","email", "status"
        it("sort customer list, httpcode #200", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("records");
            chai_1.expect(result.body.data).to.have.property("recordsMetaData");
        }));
        it("invalid sort companyName1 customer list, httpcode #422", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName1]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(422);
        }));
    });
    describe("Logged in from customer", () => {
        it("customer list, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("filter customer list by company name or uniqueId, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique]=" + "cnameadmin")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("invalid filter firstLastAndUnique  sending customer list, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("filter customer list by regionId, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("invalid filter regionId  sending customer list, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?filter[regionId1]=" + 2)
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
        // "companyName", "uniqueId", "firstName","lastName","email", "status"
        it("sort customer list, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
        it("invalid sort companyName1 customer list, httpcode #403", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers?sortBy[companyName1]=asc")
                .set("user-agent", "mocha")
                .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);
            chai_1.expect(result.statusCode).to.equal(403);
        }));
    });
});
