"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setResponse = void 0;
class ResModal {
}
const setResponse = (req, res, next) => {
    // res.sendResponse = (httpCode:number, message:string, data?:object)=>{
    //     switch(httpCode){
    //         case 200:
    //         case 201:
    //         break;
    //         default:
    //             throw new Error(`${httpCode} error code is not mentioned.`);
    //     }
    //     const payload:ResModal = {
    //         "status_code": httpCode,
    //         "message": message,
    //         "data":data
    //    };
    //     return res.status(httpCode).json(payload);
    // }
    next();
};
exports.setResponse = setResponse;
// exports.ResModal = typeof ResModal;
