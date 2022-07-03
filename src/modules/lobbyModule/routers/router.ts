import { RegisterOptions, RouteHandlerMethod } from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as controller from "./controller";
import * as socketController from "./lobbyController";
import { WebsocketHandler } from "@fastify/websocket";

export const opts: RegisterOptions = {
  prefix: "/lobby",
};

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/createLobby",
    handler: (): void => {
      console.log("Lobby created");
    },
    wsHandler: <WebsocketHandler>socketController.setConnection,
  },
  {
    method: "GET",
    url: "/joinLobby",
    handler: (): void => {
      console.log("Client joined");
    },
    wsHandler: <WebsocketHandler>socketController.joinLobby,
  },
  {
    method: "POST",
    url: "/disconnectLobby",
    handler: <RouteHandlerMethod>controller.disconnectLobby,
  },
  {
    method: "POST",
    url: "/startLobby",
    handler: controller.startLobby,
  },
];
