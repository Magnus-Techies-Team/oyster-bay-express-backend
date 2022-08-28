import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { socketRegistry /*,lobbyManager*/ } from "~/projectDependencies";

export const setConnection = (
  connection: SocketStream,
  request: FastifyRequest
): void => {
  const clientId = <string>request.cookies.uuid;
  socketRegistry.add(connection.socket, clientId);
  // connection.socket.on("close", () => {
  //   lobbyManager.disconnectLobby(clientId);
  // });
};
