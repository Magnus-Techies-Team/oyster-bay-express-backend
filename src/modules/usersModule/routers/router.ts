import { RouteOptions } from "@fastify/websocket";
import {
  preValidationHookHandler,
  RegisterOptions,
  RouteHandlerMethod,
} from "fastify";
import { verifyJWTHook } from "~/modules/utils/verifyJWThook";
import * as controller from "./controller";
import { hashPassword } from "./hooks";

export const opts: RegisterOptions = {
  prefix: "/users",
};

export const routes: RouteOptions[] = [
  {
    method: "POST",
    url: "/signUp",
    handler: <RouteHandlerMethod>controller.createUser,
    preValidation: <preValidationHookHandler>hashPassword,
  },
  {
    method: "POST",
    url: "/signIn",
    handler: <RouteHandlerMethod>controller.login,
    preValidation: <preValidationHookHandler>hashPassword,
  },
  {
    method: "GET",
    url: "/getUser",
    handler: <RouteHandlerMethod>controller.getUser,
    preValidation: verifyJWTHook,
  },
  {
    method: "POST",
    url: "/signOut",
    handler: controller.logout,
  },
];
