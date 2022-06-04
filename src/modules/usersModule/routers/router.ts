import { RouteOptions } from "@fastify/websocket";
import { RegisterOptions } from "fastify";
import * as controller from "./controller";

export const opts: RegisterOptions = {
  prefix: "/users",
};

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/test",
    handler: (req, rep) => { /**/},
    websocket: false,
    wsHandler: controller.createUser,
  },
];
