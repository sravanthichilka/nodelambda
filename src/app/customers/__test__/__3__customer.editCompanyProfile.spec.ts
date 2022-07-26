import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE } from "../../../helper/constants";
import MESSAGE_ENUM from "../../../helper/message";
import {
  commonPassword,
  roleLoginCredentails,
  getTeamUserIdsFn,
  getCompanyIdsFn,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "./helper";
import userRepo from "../../users/users.repo";

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
let company_1_UserListIds: number[] = [];
let company_2_UserListIds: number[] = [];
let companyListIds: number[] = [];
let teamUserIds: number[] = [];

describe("Customer Suit (put /customers/:companyId)", () => {
  before(async function () {
    SUPERADMIN_ACCESS_TOKEN = await getLoginAccessTokenFn(
      roleLoginCredentails.superAdmin.credentails
    );
    ADMIN_ACCESS_TOKEN = await getLoginAccessTokenFn(roleLoginCredentails.admin.credentails);
    TEAMMEMBER_ACCESS_TOKEN = await getLoginAccessTokenFn(
      roleLoginCredentails.teamMember.credentails
    );
    CUSTOMER_USER_ACCESS_TOKEN = await getLoginAccessTokenFn(
      roleLoginCredentails.customer.credentails
    );
    companyListIds = await getCompanyIdsFn(SUPERADMIN_ACCESS_TOKEN);
    companyListIds.sort();
    company_1_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 1);
    company_2_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 2);
    teamUserIds = await getTeamUserIdsFn(SUPERADMIN_ACCESS_TOKEN);
  });

  it("update customer by customuser, http code 403 ", async () => {
    const loginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.customer.credentails);

    const accessToken = loginResult.body.data.accessToken;

    let addCustomerDataCopy: any = { ...addCustomerData };
    addCustomerDataCopy.companyInfo.companyName = "cname_superadmin";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin";
    addCustomerDataCopy.assignedTeamMember = [];
    const result = await request(app)
      .put("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(403);
  });

  describe("Logged in from Superadmin", () => {
    it("update customer by superadmin, customer #1 invalid assignedteammember ids, http code 409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.companyInfo.companyName = "update_superadmin";
      addCustomerDataCopy.companyInfo.uniqueId = "updatesuperadmin";
      addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
      const result = await request(app)
        .put("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("update customer #1 company name and uniquid by superadmin, http code 200 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.companyInfo.companyName = "update_superadmin_random";
      addCustomerDataCopy.companyInfo.uniqueId = "update_superadmin_random";
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .put("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("id");
    });

    it("update customer #2 same company name by superadmin, http code 409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.companyInfo.companyName = "update_superadmin_random";
      addCustomerDataCopy.companyInfo.uniqueId = "update_superadmin_random1";
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .put("/customers/2")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("update customer #2 same uniqueId name by superadmin, http code 409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.companyInfo.companyName = "update_superadmin_random1";
      addCustomerDataCopy.companyInfo.uniqueId = "update_superadmin_random";
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .put("/customers/2")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("cross check update customer #1 by superadmin with empty assignedTeamMember, check company detail, http code 200 ", async () => {
      const result = await request(app)
        .get("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      const responseAssignedUserIds: number[] = [];
      result.body.data.assignedTeamMember.map((rec: any) => {
        responseAssignedUserIds.push(rec.id);
      });
      responseAssignedUserIds.sort();

      expect(result.statusCode).to.equal(200);
      expect([]).to.eql(responseAssignedUserIds);
      expect(result.body.data).to.have.property("customerUser");
      expect(result.body.data).to.have.property("companyInfo");
      expect(result.body.data).to.have.property("assignedTeamMember");
    });
  });

  it("customerUser is not sending by superadmin, http code 422 ", async () => {
    let addCustomerDataCopy: any = { ...addCustomerData };
    delete addCustomerDataCopy.customerUser;

    const result = await request(app)
      .put("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(422);
  });

  it("companyInfo is not sending by superadmin, http code 422 ", async () => {
    let addCustomerDataCopy: any = { ...addCustomerData };
    delete addCustomerDataCopy.companyInfo;

    const result = await request(app)
      .put("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(422);
  });

  it("update customer by superadmin with assignedTeamMember, http code 200 ", async () => {
    let addCustomerDataCopy: any = { ...addCustomerData };

    addCustomerDataCopy.assignedTeamMember = teamUserIds;

    addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1124";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1123";

    const result = await request(app)
      .put("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(200);
    expect(result.body.data).to.have.property("id");
  });

  it("check company detail customer by superadmin with assignedTeamMember exist, check company detail, http code 200 ", async () => {
    let addCustomerDataCopy: any = { ...addCustomerData };

    addCustomerDataCopy.assignedTeamMember = teamUserIds;

    addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1";

    const result = await request(app)
      .get("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

    const responseAssignedUserIds: number[] = [];
    result.body.data.assignedTeamMember.map((rec: any) => {
      responseAssignedUserIds.push(rec.id);
    });

    responseAssignedUserIds.sort();
    addCustomerDataCopy.assignedTeamMember.sort();

    expect(result.statusCode).to.equal(200);
    expect(addCustomerDataCopy.assignedTeamMember).to.eql(responseAssignedUserIds);
    expect(result.body.data).to.have.property("customerUser");
    expect(result.body.data).to.have.property("companyInfo");
    expect(result.body.data).to.have.property("assignedTeamMember");
  });

  it("update customer by team member (it wont effect) with assignedTeamMember, http code 200 ", async () => {
    const loginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.teamMember.credentails);

    const accessToken = loginResult.body.data.accessToken;

    let addCustomerDataCopy: any = { ...addCustomerData };

    addCustomerDataCopy.assignedTeamMember = [];
    addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1124";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1123";

    const result = await request(app)
      .put("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(200);
    expect(result.body.data).to.have.property("id");
  });

  it("check company detail, customer by teammember with assignedTeamMember exist (it wont effect), check company detail, http code 200 ", async () => {
    const loginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.superAdmin.credentails);

    let accessToken = loginResult.body.data.accessToken;

    let addCustomerDataCopy: any = { ...addCustomerData };

    const teammemberList = await request(app)
      .get("/teammembers/fetch")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken);

    const teamMemberLoginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.teamMember.credentails);
    accessToken = teamMemberLoginResult.body.data.accessToken;

    let existingAssignTeamMember: number[] = [];
    teammemberList.body.data.records.map((rec: any) => {
      existingAssignTeamMember.push(rec.id);
    });

    addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1";
    addCustomerDataCopy.assignedTeamMember = [];

    const result = await request(app)
      .get("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken);

    const responseAssignedUserIds: number[] = [];
    result.body.data.assignedTeamMember.map((rec: any) => {
      responseAssignedUserIds.push(rec.id);
    });

    responseAssignedUserIds.sort();
    existingAssignTeamMember.sort();

    expect(result.statusCode).to.equal(200);
    expect(existingAssignTeamMember).to.eql(responseAssignedUserIds);
    expect(result.body.data).to.have.property("customerUser");
    expect(result.body.data).to.have.property("companyInfo");
    expect(result.body.data).to.have.property("assignedTeamMember");
  });

  it("update customer by superadmin with assignedTeamMember exist (remove teammember@yopmail.com from company 1), check company detail, http code 200 ", async () => {
    const loginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.superAdmin.credentails);

    const accessToken = loginResult.body.data.accessToken;

    let addCustomerDataCopy: any = { ...addCustomerData };

    const teammemberList = await request(app)
      .get("/teammembers/fetch")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken);

    addCustomerDataCopy.assignedTeamMember = [];
    teammemberList.body.data.records.map((rec: any) => {
      if (rec.email !== roleLoginCredentails.teamMember.credentails.email) {
        addCustomerDataCopy.assignedTeamMember.push(rec.id);
      }
    });

    addCustomerDataCopy.companyInfo.companyName = "cnamesuperadmin12312312";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin1231231";

    const result = await request(app)
      .put("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(200);
    expect(result.body.data).to.have.property("id");
  });

  it("update customer by superadmin with assignedTeamMember exist (add teammember@yopmail.com from company 2), check company detail, http code 200 ", async () => {
    const loginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.superAdmin.credentails);

    const accessToken = loginResult.body.data.accessToken;

    let addCustomerDataCopy: any = { ...addCustomerData };

    const teammemberList = await request(app)
      .get("/teammembers/fetch")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken);

    addCustomerDataCopy.assignedTeamMember = [];
    teammemberList.body.data.records.map((rec: any) => {
      addCustomerDataCopy.assignedTeamMember.push(rec.id);
    });

    addCustomerDataCopy.companyInfo.companyName = "cnamesuperadmin1231231222";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin123123122";

    const result = await request(app)
      .put("/customers/2")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(200);
    expect(result.body.data).to.have.property("id");
  });

  it("update company by removed teammember with assignedTeamMember exist (remove teammember@yopmail.com from company 1), check company detail, http code 403 ", async () => {
    const loginResult = await request(app)
      .post("/auth/login")
      .set("user-agent", "mocha")
      .send(roleLoginCredentails.teamMember.credentails);

    const accessToken = loginResult.body.data.accessToken;

    let addCustomerDataCopy: any = { ...addCustomerData };
    addCustomerDataCopy.assignedTeamMember = [];
    addCustomerDataCopy.companyInfo.companyName = "cname_superadmin1124234234";
    addCustomerDataCopy.companyInfo.uniqueId = "cnamesuperadmin112312344";

    const result = await request(app)
      .put("/customers/1")
      .set("user-agent", "mocha")
      .set("Authorization", accessToken)
      .send(addCustomerDataCopy);

    expect(result.statusCode).to.equal(403);
    expect(result.body.message).to.equal(MESSAGE_ENUM.TEAM_MEMBER_IS_NOT_ASSIGN_TO_COMPNAY);
  });
});
