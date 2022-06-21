import { RegisterOptions, RouteHandlerMethod } from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as controller from "./controller";
import { joinLobby } from "../../lobbyModule/routers/lobbyController";
import { WebsocketHandler } from "@fastify/websocket";

export const opts: RegisterOptions = {
  prefix: "/quiz",
};

export const routes: RouteOptions[] = [
  {
    method: "GET",
    url: "/createQuiz",
    handler: <RouteHandlerMethod>controller.createQuiz,
    wsHandler: <WebsocketHandler>joinLobby,
  },
  {
    method: "POST",
    url: "/createLobby",
    handler: <RouteHandlerMethod>controller.createLobby,
  },
  {
    method: "GET",
    url: "/joinLobby",
    handler: () => {
      console.log("");
    },
    wsHandler: <WebsocketHandler>joinLobby,
  },
  {
    method: "POST",
    url: "/disconnectLobby",
    handler: <RouteHandlerMethod>controller.disconnectLobby,
  },
];
