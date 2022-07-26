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
const message_1 = __importDefault(require("../../../helper/message"));
const helper_1 = require("./helper");
const addCustomerData = {
    customerUser: {
        firstName: "test",
        lastName: "test",
    },
    companyInfo: {
        companyName: "test222111",
        companyAddress: "test",
        uniqueId: "test11221",
        regionId: 3,
    },
    assignedTeamMember: [1],
};
let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds = [];
let company_2_UserListIds = [];
let companyListIds = [];
let teamUserIds = [];
describe("Customer Suit (put /customers/:companyId)", () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            SUPERADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.superAdmin.credentails);
            ADMIN_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.admin.credentails);
            TEAMMEMBER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.teamMember.credentails);
            CUSTOMER_USER_ACCESS_TOKEN = yield helper_1.getLoginAccessTokenFn(helper_1.roleLoginCredentails.customer.credentails);
            companyListIds = yield helper_1.getCompanyIdsFn(SUPERADMIN_ACCESS_TOKEN);
            companyListIds.sort();
            company_1_UserListIds = yield helper_1.getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 1);
            company_2_UserListIds = yield helper_1.getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 2);
            teamUserIds = yield helper_1.getTeamUserIdsFn(SUPERADMIN_ACCESS_TOKEN);
        });
    });
    it("update customer by customuser, http code 403 ", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResult = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.customer.credentails);
        const accessToken = loginResult.body.data.accessToken;
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        addCustomerDataCopy.companyInfo.companyName = "cname_superadmin";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin";
        addCustomerDataCopy.assignedTeamMember = [];
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(403);
    }));
    describe("Logged in from Superadmin", () => {
        it("update customer by superadmin, customer #1 invalid assignedteammember ids, http code 409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.companyInfo.companyName = "update_superadmin";
            addCustomerDataCopy.companyInfo.uniqueId = "updatesuperadmin";
            addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
            const result = yield supertest_1.default(main_1.default)
                .put("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("update customer #1 company name and uniquid by superadmin, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.companyInfo.companyName = "update_superadmin_random";
            addCustomerDataCopy.companyInfo.uniqueId = "update_superadmin_random";
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .put("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect(result.body.data).to.have.property("id");
        }));
        it("update customer #2 same company name by superadmin, http code 409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.companyInfo.companyName = "update_superadmin_random";
            addCustomerDataCopy.companyInfo.uniqueId = "update_superadmin_random1";
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .put("/customers/2")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("update customer #2 same uniqueId name by superadmin, http code 409 ", () => __awaiter(void 0, void 0, void 0, function* () {
            let addCustomerDataCopy = Object.assign({}, addCustomerData);
            addCustomerDataCopy.companyInfo.companyName = "update_superadmin_random1";
            addCustomerDataCopy.companyInfo.uniqueId = "update_superadmin_random";
            addCustomerDataCopy.assignedTeamMember = [];
            const result = yield supertest_1.default(main_1.default)
                .put("/customers/2")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
                .send(addCustomerDataCopy);
            chai_1.expect(result.statusCode).to.equal(409);
        }));
        it("cross check update customer #1 by superadmin with empty assignedTeamMember, check company detail, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield supertest_1.default(main_1.default)
                .get("/customers/1")
                .set("user-agent", "mocha")
                .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
            const responseAssignedUserIds = [];
            result.body.data.assignedTeamMember.map((rec) => {
                responseAssignedUserIds.push(rec.id);
            });
            responseAssignedUserIds.sort();
            chai_1.expect(result.statusCode).to.equal(200);
            chai_1.expect([]).to.eql(responseAssignedUserIds);
            chai_1.expect(result.body.data).to.have.property("customerUser");
            chai_1.expect(result.body.data).to.have.property("companyInfo");
            chai_1.expect(result.body.data).to.have.property("assignedTeamMember");
        }));
    });
    it("customerUser is not sending by superadmin, http code 422 ", () => __awaiter(void 0, void 0, void 0, function* () {
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        delete addCustomerDataCopy.customerUser;
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(422);
    }));
    it("companyInfo is not sending by superadmin, http code 422 ", () => __awaiter(void 0, void 0, void 0, function* () {
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        delete addCustomerDataCopy.companyInfo;
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(422);
    }));
    it("update customer by superadmin with assignedTeamMember, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        addCustomerDataCopy.assignedTeamMember = teamUserIds;
        addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1124";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1123";
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(200);
        chai_1.expect(result.body.data).to.have.property("id");
    }));
    it("check company detail customer by superadmin with assignedTeamMember exist, check company detail, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        addCustomerDataCopy.assignedTeamMember = teamUserIds;
        addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1";
        const result = yield supertest_1.default(main_1.default)
            .get("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", SUPERADMIN_ACCESS_TOKEN);
        const responseAssignedUserIds = [];
        result.body.data.assignedTeamMember.map((rec) => {
            responseAssignedUserIds.push(rec.id);
        });
        responseAssignedUserIds.sort();
        addCustomerDataCopy.assignedTeamMember.sort();
        chai_1.expect(result.statusCode).to.equal(200);
        chai_1.expect(addCustomerDataCopy.assignedTeamMember).to.eql(responseAssignedUserIds);
        chai_1.expect(result.body.data).to.have.property("customerUser");
        chai_1.expect(result.body.data).to.have.property("companyInfo");
        chai_1.expect(result.body.data).to.have.property("assignedTeamMember");
    }));
    it("update customer by team member (it wont effect) with assignedTeamMember, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResult = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.teamMember.credentails);
        const accessToken = loginResult.body.data.accessToken;
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        addCustomerDataCopy.assignedTeamMember = [];
        addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1124";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1123";
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(200);
        chai_1.expect(result.body.data).to.have.property("id");
    }));
    it("check company detail, customer by teammember with assignedTeamMember exist (it wont effect), check company detail, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResult = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.superAdmin.credentails);
        let accessToken = loginResult.body.data.accessToken;
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        const teammemberList = yield supertest_1.default(main_1.default)
            .get("/teammembers/fetch")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken);
        const teamMemberLoginResult = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.teamMember.credentails);
        accessToken = teamMemberLoginResult.body.data.accessToken;
        let existingAssignTeamMember = [];
        teammemberList.body.data.records.map((rec) => {
            existingAssignTeamMember.push(rec.id);
        });
        addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1";
        addCustomerDataCopy.assignedTeamMember = [];
        const result = yield supertest_1.default(main_1.default)
            .get("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken);
        const responseAssignedUserIds = [];
        result.body.data.assignedTeamMember.map((rec) => {
            responseAssignedUserIds.push(rec.id);
        });
        responseAssignedUserIds.sort();
        existingAssignTeamMember.sort();
        chai_1.expect(result.statusCode).to.equal(200);
        chai_1.expect(existingAssignTeamMember).to.eql(responseAssignedUserIds);
        chai_1.expect(result.body.data).to.have.property("customerUser");
        chai_1.expect(result.body.data).to.have.property("companyInfo");
        chai_1.expect(result.body.data).to.have.property("assignedTeamMember");
    }));
    it("update customer by superadmin with assignedTeamMember exist (remove teammember@yopmail.com from company 1), check company detail, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResult = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.superAdmin.credentails);
        const accessToken = loginResult.body.data.accessToken;
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        const teammemberList = yield supertest_1.default(main_1.default)
            .get("/teammembers/fetch")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken);
        addCustomerDataCopy.assignedTeamMember = [];
        teammemberList.body.data.records.map((rec) => {
            if (rec.email !== helper_1.roleLoginCredentails.teamMember.credentails.email) {
                addCustomerDataCopy.assignedTeamMember.push(rec.id);
            }
        });
        addCustomerDataCopy.companyInfo.companyName = "cnamesuperadmin12312312";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1231231";
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(200);
        chai_1.expect(result.body.data).to.have.property("id");
    }));
    it("update customer by superadmin with assignedTeamMember exist (add teammember@yopmail.com from company 2), check company detail, http code 200 ", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResult = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.superAdmin.credentails);
        const accessToken = loginResult.body.data.accessToken;
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        const teammemberList = yield supertest_1.default(main_1.default)
            .get("/teammembers/fetch")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken);
        addCustomerDataCopy.assignedTeamMember = [];
        teammemberList.body.data.records.map((rec) => {
            addCustomerDataCopy.assignedTeamMember.push(rec.id);
        });
        addCustomerDataCopy.companyInfo.companyName = "cnamesuperadmin1231231222";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin123123122";
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/2")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(200);
        chai_1.expect(result.body.data).to.have.property("id");
    }));
    it("update company by removed teammember with assignedTeamMember exist (remove teammember@yopmail.com from company 1), check company detail, http code 403 ", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResult = yield supertest_1.default(main_1.default)
            .post("/auth/login")
            .set("user-agent", "mocha")
            .send(helper_1.roleLoginCredentails.teamMember.credentails);
        const accessToken = loginResult.body.data.accessToken;
        let addCustomerDataCopy = Object.assign({}, addCustomerData);
        addCustomerDataCopy.assignedTeamMember = [];
        addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1124234234";
        addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin112312344";
        const result = yield supertest_1.default(main_1.default)
            .put("/customers/1")
            .set("user-agent", "mocha")
            .set("Authorization", accessToken)
            .send(addCustomerDataCopy);
        chai_1.expect(result.statusCode).to.equal(403);
        chai_1.expect(result.body.message).to.equal(message_1.default.TEAM_MEMBER_IS_NOT_ASSIGN_TO_COMPNAY);
    }));
});
