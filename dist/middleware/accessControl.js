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
const roles_1 = __importDefault(require("./roles"));
class AccessControl {
    constructor() {
        this.grantAccess = function (action, resource) {
            return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const permission = yield roles_1.default.can(req.User.UserType)[action](resource);
                    if (!permission.granted) {
                        return res.status(401).json({
                            error: "You don't have enough permission to perform this action"
                        });
                    }
                    next();
                }
                catch (error) {
                    // next(error)
                    return res.status(401).json({
                        error: "You don't have enough permission to perform this action"
                    });
                }
            });
        };
        this.grantAccessUserSubType = function (action, resource) {
            return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // const permission = await roles.can(req.User.UserType)[action](resource);
                    const permission = yield roles_1.default.can(req.User.UserSubType)[action](resource);
                    if (!permission.granted) {
                        return res.status(401).json({
                            error: "You don't have enough permission to perform this action"
                        });
                    }
                    next();
                }
                catch (error) {
                    return res.status(401).json({
                        error: "You don't have enough permission to perform this action"
                    });
                }
            });
        };
    }
}
exports.default = new AccessControl();
