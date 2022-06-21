import { RouteOptions } from "@fastify/websocket";
import { preValidationHookHandler, RegisterOptions, RouteHandlerMethod } from "fastify";
import * as controller from "./controller";
import { hashPassword } from "./hooks";

export const opts: RegisterOptions = {
  prefix: "/users",
};

export const routes: RouteOptions[] = [
  {
    method: "POST",
    url: "/createUser",
    handler: <RouteHandlerMethod>controller.createUser,
    preValidation: <preValidationHookHandler>hashPassword
  },
  {
    method: "POST",
    url: "/login",
    handler: <RouteHandlerMethod>controller.login,
    preValidation: <preValidationHookHandler>hashPassword
  },
];
