import { RegisterOptions } from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as socketController from "./lobbyController";
import { WebsocketHandler } from "@fastify/websocket";

export const opts: RegisterOptions = {
  prefix: "/lobby",
};

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/setConnection",
    handler: (): void => {
      console.log("Lobby created");
    },
    wsHandler: <WebsocketHandler>socketController.setConnection,
  },
];
