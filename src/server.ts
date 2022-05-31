import fastify, { FastifyPluginCallback } from "fastify";
import { Server } from "./server/server";
import websocketPlugin from "@fastify/websocket";

const server = new Server(fastify({ logger: true }));

server.registerPlugin({ pluginInstance: websocketPlugin, options: {} });

server.registerApi();

export default server;