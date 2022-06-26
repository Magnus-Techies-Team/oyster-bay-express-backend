import { verifyJWTHook } from "../../utils/verifyJWThook";
import { RegisterOptions, RouteHandlerMethod } from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as controller from "./controller";

export const opts: RegisterOptions = {
  prefix: "/quiz",
};

export const routes: RouteOptions[] = [
  {
    method: "POST",
    url: "/createQuiz",
    handler: <RouteHandlerMethod>controller.createQuiz,
    preValidation: verifyJWTHook,
  },
  {
    method: "GET",
    url: "/getAllAvailableQuizzes",
    handler: <RouteHandlerMethod>controller.getQuiz,
    preValidation: verifyJWTHook
  }
];
