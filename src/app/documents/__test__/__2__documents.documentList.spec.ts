import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";

import {
  commonPassword,
  roleLoginCredentails,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds: number[] = [];
let company_2_UserListIds: number[] = [];

describe("Document List Suit (POST /documents?companyId=1&filter[documentName]=BIRKO_LOGOjpg&filter[documentType]=1&sortBy[documentTypeName]=asc)", () => {
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

    company_1_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 1);
    company_2_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 2);
  });

  describe("Logged in from Superadmin", () => {
    it("document list, httpcode #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company Id #1,  httpcode #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("onSiteSystemData");
    });

    it("document list with filter[documentName], httpcode #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentName]=birk`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with filter[documentType], httpcode #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentType]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with sortBy[documentTypeName], httpcode #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentTypeName]=asc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with sortBy[documentName], httpcode #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentName]=desc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with invalid sortBy[documentName1], httpcode #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentName1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });

    it("document list with invalid filter[documentType1], httpcode #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentType1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from Admin", () => {
    it("document list, httpcode #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company Id #1,  httpcode #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("onSiteSystemData");
    });

    it("document list with filter[documentName], httpcode #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentName]=birk`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with filter[documentType], httpcode #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentType]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with sortBy[documentTypeName], httpcode #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentTypeName]=asc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with sortBy[documentName], httpcode #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentName]=desc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list with invalid sortBy[documentName1], httpcode #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentName1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });

    it("document list with invalid filter[documentType1], httpcode #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentType1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from TeamMember", () => {
    it("document list, httpcode #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#1,  httpcode #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("document list, company#1 with filter[documentName], httpcode #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=1&filter[documentName]=birk`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("document list, company#2 httpcode #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("onSiteSystemData");
    });

    it("document list, company#2 with filter[documentName], httpcode #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2&filter[documentName]=birk`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#2 with filter[documentType], httpcode #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2&filter[documentType]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#2 with sortBy[documentTypeName], httpcode #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2&sortBy[documentTypeName]=asc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#2 with sortBy[documentName], httpcode #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2&sortBy[documentName]=desc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#2 with invalid sortBy[documentName1], httpcode #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2&sortBy[documentName1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });

    it("document list, company#2 with invalid filter[documentType1], httpcode #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2&filter[documentType1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from CustomerUser", () => {
    it("document list, company#2 httpcode #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("document list, company#2 with filter[documentName], httpcode #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?companyId=2&filter[documentName]=birk`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("document list, company#1 httpcode #200", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#1 with filter[documentName], httpcode #200", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentName]=birk`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#1 with filter[documentType], httpcode #200", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentType]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#1 with sortBy[documentTypeName], httpcode #200", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentTypeName]=asc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#1 with sortBy[documentName], httpcode #200", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentName]=desc`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("document list, company#1 with invalid sortBy[documentName1], httpcode #422", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?sortBy[documentName1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });

    it("document list, company#1 with invalid filter[documentType1], httpcode #422", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/documents?filter[documentType1]=1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });
  });
});
