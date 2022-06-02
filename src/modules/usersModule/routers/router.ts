import { RouteOptions, RegisterOptions, RouteHandlerMethod } from "fastify";
import * as controller from "./controller";

export const opts: RegisterOptions = {
  prefix: "/users",
};

export const routes: RouteOptions[] = [
  {
    method: "POST",
    url: "/createUser",
    handler: <RouteHandlerMethod>controller.createUser,
  },
];
