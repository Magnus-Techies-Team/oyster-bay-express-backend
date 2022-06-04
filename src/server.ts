import fastify, { FastifyPluginCallback } from "fastify";
import { Server } from "./server/server";
import websocketPlugin from "@fastify/websocket";
import * as usersModule from "./modules/usersModule/routers";


const server = new Server(fastify({ logger: true }));

server.registerPlugin({ pluginInstance: websocketPlugin, options: {} });
server.registerRouter(usersModule);
server.registerApi();

export default server;