import Controller from "../Controller";
import jwt from "jsonwebtoken";
import config from "../../config/app";
import { ENUM_User_ROLE } from "../../helper/constants";
import { customAlphabet } from "nanoid";

const crypto = require("crypto");

class AuthHelperController extends Controller {
  createRandomNumber() {
    const id = crypto.randomBytes(4).toString("hex");
    return id;
  }

  async createHash(salt: any, email: string, password: string) {
    var db_salt = salt;
    const plain = (email + " " + db_salt + " " + password).toLowerCase();
    var buffer = Buffer.from(plain);
    var hash = crypto.createHash("SHA512").update(buffer, "utf-8").digest("base64");

    return hash;
  }

  async createSalt() {
    var salt = crypto.randomBytes(250).toString("base64");
    return salt;
  }
  /**
   * Hash check
   *
   * @param user object
   * @param email string
   * @param password string
   * @returns
   */
  async hashCheck(user: any, email: string, password: string): Promise<boolean> {
    var db_hash = user.hash;
    var db_salt = user.salt;

    const plain = (email + " " + db_salt + " " + password).toLowerCase();
    var buffer = Buffer.from(plain);
    var hash = crypto.createHash("SHA512").update(buffer, "utf-8").digest("base64");

    if (db_hash == hash) {
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   * @param user_id
   * @param tokenType
   * @returns token
   */
  async generateAuthToken(user_id: number, tokenType: "access" | "refresh" | "reset_password") {
    const app_name = config.app.APP_NAME;

    // mentioned in type>index.ts
    // removed: got error while run seed command.

    type secret =
      | string
      | Buffer
      | {
          key: string | Buffer;
          passphrase: string;
        };

    let JWT_key: secret;
    let expiresIn: number | string;

    switch (tokenType) {
      case "access":
        JWT_key = <string>config.jwt.SECRET_KEY;
        expiresIn = <string>config.jwt.TOKEN_EXPIRES_IN;
        break;
      case "refresh":
        JWT_key = <string>config.jwt.REFRESH_KEY;
        expiresIn = <number>config.jwt.REFRESH_EXPIRES_IN;
        break;
      case "reset_password":
        JWT_key = <string>config.jwt.SECRET_KEY;
        expiresIn = <string>config.jwt.RESET_PASSWORD_EXPIRES_IN;
        break;
    }
    const payload = { id: user_id, name: app_name };
    const token = jwt.sign(payload, JWT_key, {
      expiresIn: expiresIn,
    });
    return token;
  }

  static createNanoid() {
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nanoid = customAlphabet(alphabet, 8);
    return nanoid();
  }

  /**
   *
   * We compare currentRole<compareRole
   * example
   * admin has 2 current role
   *  he can not change data of 1 compare role id
   *  he can not change data of 2 compare role id
   *  he can change data of 3 compare role id
   *
   * @param currentRole
   * @param compareRole
   * @returns
   */
  isCurrentRoleAuthorize(currentRole: number, compareRole: number) {
    if (currentRole === ENUM_User_ROLE.SUPERADMIN) {
      return true;
    }

    if (currentRole < compareRole) {
      return true;
    } else {
      return false;
    }
  }
}

export default AuthHelperController;
