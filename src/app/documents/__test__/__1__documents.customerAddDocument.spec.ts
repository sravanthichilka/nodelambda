import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE, ENUM_User_Status, ENUM_PREFIX_FILE_PATH } from "../../../helper/constants";

import {
  commonPassword,
  roleLoginCredentails,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";
import customersRepo from "../../customers/customers.repo";

const addDocument = {
  documentKeyName: "logo.png",
  documentType: 1,
  documentName: "BIRKO_LOGO",
  documentFormat: "png",
  documentsizeInByte: "4000000",
};

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company1_DETAIL: any;
let company2_DETAIL: any;

describe("Customer addDocument Suit (POST /customers/:companyId/documents)", () => {
  before(async function () {
    company1_DETAIL = await customersRepo.companyData(1);
    company2_DETAIL = await customersRepo.companyData(2);

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
    it("add document by superadmin, http code #201", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      addDocument.documentKeyName =
        company1_DETAIL.preS3KeyName +
        "/" +
        ENUM_PREFIX_FILE_PATH.DOC +
        "/" +
        new Date().getTime() +
        ".png";

      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);

      expect(result.statusCode).to.equal(201);
    });

    it("again same document name add by superadmin, duplicate file name, http code #409", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(409);
    });

    it("send invalid field , logged in superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("add document by superadmin, deactive customer , http code #403", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .post(`/customers/3/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from admin", () => {
    it("add document by admin, http code #201", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      addDocument.documentKeyName =
        company1_DETAIL.preS3KeyName + "/docs/" + new Date().getTime() + ".png";
      addDocument.documentName = "birkologo_admin";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(201);
    });

    it("again same document name add by admin, duplicate file name, http code #409", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_admin";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(409);
    });

    it("send invalid field , logged in admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_admin";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("add document by admin, deactive customer , http code #403", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_admin";
      const result = await request(app)
        .post(`/customers/3/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from teammember", () => {
    it("add document by teammember, customer #1, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentKeyName = "birkologo_teammember.png";
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });

    it("again same document name add by teammember, customer #1, duplicate file name, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });

    it("add document by teammember, customer #2, http code #201", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentKeyName = "birkologo_teammember.png";
      addDocument.documentName = "birkologo_teammember";
      addDocument.documentKeyName =
        company2_DETAIL.preS3KeyName + "/docs/" + new Date().getTime() + ".png";

      const result = await request(app)
        .post(`/customers/2/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(201);
    });

    it("again same document name add by teammember, customer #2, duplicate file name, http code #409", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/2/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(409);
    });

    it("add document by teammember, customer #3, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/3/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });

    it("again same document name add by teammember, customer #3, duplicate file name, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/3/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field , logged in teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("add document by teammember, deactive customer , http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/3/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customer", () => {
    it("add document by customer, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });

    it("again same document name add by customer, duplicate file name, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field , logged in customer, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/1/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(403);
    });

    it("add document by customer, deactive customer , http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/3/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });

    it("add document by customer, not link with customer, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      addDocument.documentName = "birkologo_teammember";
      const result = await request(app)
        .post(`/customers/2/documents`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addDocument);
      expect(result.statusCode).to.equal(403);
    });
  });
});
