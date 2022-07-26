"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (request, response, next) => {
    response.status(404).send({ status_code: 404, message: "Resource not found." });
};
exports.notFoundHandler = notFoundHandler;
