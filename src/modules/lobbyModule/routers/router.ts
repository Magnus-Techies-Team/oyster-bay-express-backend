import { RegisterOptions, RouteHandlerMethod } from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as controller from "./controller";
import * as lobbyController from "./lobbyController";
import { WebsocketHandler } from "@fastify/websocket";

export const opts: RegisterOptions = {
  prefix: "/lobby",
};

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/createLobby",
    handler: () => {
      console.log("Lobby created");
    },
    wsHandler: <WebsocketHandler>lobbyController.createLobby,
  },
  {
    method: "GET",
    url: "/joinLobby",
    handler: () => {
      console.log("Client joined");
    },
    wsHandler: <WebsocketHandler>lobbyController.joinLobby,
  },
  {
    method: "POST",
    url: "/disconnectLobby",
    handler: <RouteHandlerMethod>controller.disconnectLobby,
  },
];
