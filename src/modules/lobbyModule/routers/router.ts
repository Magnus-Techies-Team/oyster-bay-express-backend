import {RegisterOptions, RouteHandler} from "fastify";
import { RouteOptions } from "@fastify/websocket";
import * as socketController from "./lobbyController";
import * as controller from "./controller";
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
  {
    method: "GET",
    url: "/getCurrentLobbyStatus/:lobbyId",
    handler: <RouteHandler>controller.getCurrentLobbyStatus,
  },
  {
    method: "GET",
    url: "/getAllAvailableLobbies",
    handler: <RouteHandler>controller.getAllAvailableLobbies,
  },
  {
    method: "GET",
    url: "/getUserActiveLobby",
    handler: <RouteHandler>controller.getUserActiveLobby,
  },
  {
    method: "GET",
    url: "/getLobby",
    handler: <RouteHandler>controller.getLobby,
  }
];
