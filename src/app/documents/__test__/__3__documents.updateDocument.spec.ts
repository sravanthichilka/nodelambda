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

const updateDocument = {
  documentType: 1,
  documentName: "update_birko_logo",
};

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

describe("move Document Suit (PUT /:companyId/documents/:documentId)", () => {
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
  });

  describe("Logged in from Superadmin", () => {
    it("update document, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(200);
    });

    it("update document, wrong document ID #12323, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/12323`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(422);
    });

    it("update document, deleted document ID #2, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/12323`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(422);
    });

    it("update document, invalid company #123123, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/123123/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(422);
    });

    it("update document type #2, by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const updateDocData = { ...updateDocument };
      updateDocData.documentType = 2;

      const result = await request(app)
        .put(`/customers/1/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocData);

      expect(result.statusCode).to.equal(200);
    });

    it("invalid field name, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/1?filter1[nameOrUniqueId1]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ updateDocument: "updatedocument" });
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("update document, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(200);
    });

    it("update document, wrong document ID #12323, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/12323`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(422);
    });

    it("update document, deleted document ID #2, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/12323`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(422);
    });

    it("update document, invalid company #123123, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/123123/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(422);
    });

    it("update document type #2, by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const updateDocData = { ...updateDocument };
      updateDocData.documentType = 2;

      const result = await request(app)
        .put(`/customers/1/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocData);

      expect(result.statusCode).to.equal(200);
    });

    it("invalid field name, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/1?filter1[nameOrUniqueId1]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ updateDocument: "updatedocument" });
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("update document, not link company #1, document #1, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .put(`/customers/1/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateDocument);

      expect(result.statusCode).to.equal(403);
    });
  });
});
