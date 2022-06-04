import { SocketStream, WebsocketHandler } from "@fastify/websocket";
import { FastifyRequest } from "fastify";

export const createUser = async (
  connection: SocketStream,
  req: FastifyRequest,
  ) => {
  setInterval(() => connection.socket.send(`1`), 1000);
};
