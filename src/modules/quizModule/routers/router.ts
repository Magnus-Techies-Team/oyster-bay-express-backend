import { verifyJWTHook } from "~/modules/utils/verifyJWThook";
import { RegisterOptions, RouteHandlerMethod } from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as controller from "./controller";
import { createQuizSchema, getQuizSchema } from "./schemas";

export const opts: RegisterOptions = {
  prefix: "/quiz",
};

export const routes: RouteOptions[] = [
  {
    method: "POST",
    url: "/createQuiz",
    handler: <RouteHandlerMethod>controller.createQuiz,
    preValidation: verifyJWTHook,
    schema: createQuizSchema
  },
  {
    method: "GET",
    url: "/getAllAvailableQuizzes",
    handler: <RouteHandlerMethod>controller.getAllQuizes,
    preValidation: verifyJWTHook,
  },
  {
    method: "GET",
    url: "/getQuiz/:id",
    handler: <RouteHandlerMethod>controller.getQuiz,
    preValidation: verifyJWTHook,
    schema: getQuizSchema
  },
];
