import app from "../../../main";
import request from "supertest";

import userRepo from "../../users/users.repo";

import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";

import { expect } from "chai";
import {
  commonPassword,
  roleLoginCredentails,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";

describe("Auth Suit (POST /auth/forgotPassword)", () => {
  describe("Logged in from Superadmin", () => {
    it("Correct email sent exist in db active_superadmin_deactive_afterforgotpassword@yopmail.com - Superadmin, httpcode #200", async () => {
      const updateDate = {
        ...roleLoginCredentails.activeSuperadmindeactiveAfterForgotPassword.credentails,
      };
      updateDate.password = "sdfsadf";

      const result = await request(app)
        .post("/auth/forgotPassword")
        .set("user-agent", "mocha")
        .send({ email: updateDate.email });

      const condition_activeSuperDeactiveIt = {
        email: roleLoginCredentails.activeSuperadmindeactiveAfterForgotPassword.credentails.email,
      };
      const user_activeSuperDeactiveIt: any = await userRepo.searchUser(
        condition_activeSuperDeactiveIt
      );
      await userRepo.updateUser(user_activeSuperDeactiveIt.id, {
        status: ENUM_User_Status.INACTIVE,
      });

      expect(result.statusCode).to.equal(200);
      expect(result.body.message).to.equal("An reset link will be send to registered email.");
    });

    it("Correct email sent exist in db  - Superadmin, httpcode #200", async () => {
      const updateDate = { ...roleLoginCredentails.superAdmin.credentails };
      updateDate.password = "sdfsadf";

      const result = await request(app)
        .post("/auth/forgotPassword")
        .set("user-agent", "mocha")
        .send({ email: updateDate.email });

      expect(result.body.message).to.equal("An reset link will be send to registered email.");
      expect(result.statusCode).to.equal(200);
    });

    it("invalid email send not exist in db, httpcode #404", async () => {
      const result = await request(app)
        .post("/auth/forgotPassword")
        .set("user-agent", "mocha")
        .send({ email: "superadmin1@yopmail.com" });

      expect(result.statusCode).to.equal(404);
    });

    it("email field not send in parameter send not exist in db, httpcode #422", async () => {
      const result = await request(app)
        .post("/auth/forgotPassword")
        .set("user-agent", "mocha")
        .send({});

      expect(result.statusCode).to.equal(422);
    });

    it("inactive user Correct email sent exist in db, httpcode #403", async () => {
      const updateDate = { ...roleLoginCredentails.deactiveAdmin.credentails };
      updateDate.password = "sdfsadf";

      const result = await request(app)
        .post("/auth/forgotPassword")
        .set("user-agent", "mocha")
        .send({ email: updateDate.email });

      expect(result.body.message).to.equal(
        "Your account is deactivated, please contact super admin."
      );
      expect(result.statusCode).to.equal(403);
    });
  });
});
