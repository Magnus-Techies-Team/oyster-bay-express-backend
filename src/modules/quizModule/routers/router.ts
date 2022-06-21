import { verifyJWTHook } from "../../utils/verifyJWThook";
import { RegisterOptions, RouteHandlerMethod } from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as controller from "./controller";

export const opts: RegisterOptions = {
  prefix: "/quiz",
};

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/createQuiz",
    handler: <RouteHandlerMethod>controller.createQuiz,
    preValidation: verifyJWTHook,
  },
];
