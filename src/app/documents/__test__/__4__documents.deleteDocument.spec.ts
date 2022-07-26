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

describe("Delete Document Suit (DELETE /:companyId/documents/:documentId)", () => {
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
        .delete(`/customers/1/documents/1`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(200);
    });
  });
});
