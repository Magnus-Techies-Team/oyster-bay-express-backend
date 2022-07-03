import fastify from "fastify";
import Server from "./server/server";
import {
  COOKIE_SETTINGS,
  CORS_SETTINGS,
  SERVER_OPTIONS,
  WEBSOCKET_SETTINGS,
} from "./config";
import * as usersModule from "./modules/usersModule/routers";
import * as quizModule from "./modules/quizModule/routers";
import * as lobbyModule from "./modules/lobbyModule/routers";
import websocketPlugin from "@fastify/websocket";
import cookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import ServiceClass from "./utils/serviceClass";
import DBHelper from "./dataSources/DBHelper";
import SocketRegistry from "./socket/socketRegistry";
import UserManager from "./modules/usersModule/utils/UserManager";
import LobbyManager from "./modules/lobbyModule/utils/LobbyManager";
import QuizManager from "./modules/quizModule/utils/QuizManager";

const fastifyInstance = fastify(SERVER_OPTIONS);
const routers = [usersModule, quizModule, lobbyModule];
const plugins = [
  { pluginInstance: websocketPlugin, options: WEBSOCKET_SETTINGS },
  { pluginInstance: cookie, options: COOKIE_SETTINGS },
  { pluginInstance: fastifyCors, options: CORS_SETTINGS },
];
export const server = new Server(fastifyInstance, routers, plugins);
export const dbHelper = new DBHelper();
export const serviceClass = new ServiceClass();
export const socketRegistry = new SocketRegistry();
export const userManager = new UserManager();
export const lobbyManager = new LobbyManager();
export const quizManager = new QuizManager();
