import { RouteOptions, RegisterOptions, RouteHandlerMethod } from "fastify";
import * as controller from "./controller";

export const opts: RegisterOptions = {
  prefix: "quiz",
};

export const routes: RouteOptions[] = [
  {
    method: "POST",
    url: "/createQuiz",
    handler: <RouteHandlerMethod>controller.createQuiz,
  },
];
