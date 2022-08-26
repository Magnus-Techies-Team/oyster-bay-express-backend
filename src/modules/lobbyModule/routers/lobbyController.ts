import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { socketRegistry /*,lobbyManager*/ } from "~/projectDependencies";

export const setConnection = (
  connection: SocketStream,
  request: FastifyRequest
): void => {
  const clientId = <string>request.headers.client_id;
  socketRegistry.add(connection.socket, clientId);
  // connection.socket.on("close", () => {
  //   lobbyManager.disconnectLobby(clientId);
  // });
};
