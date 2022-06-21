import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import socketRegistry from "../../../socket/socketRegistry";
import { RouteGenericInterfaceLobbyAction } from "../types/reqInterface";
import lobbyManager from "../utils/lobbyManager";
import { lobbyEvent } from "../../../socket/types/lobbyEvent";

export const joinLobby = (
  connection: SocketStream,
  request: FastifyRequest<RouteGenericInterfaceLobbyAction>
) => {
  const clientId = socketRegistry.getClientId(connection.socket);
  console.log(`lobbyId = ${request.query.lobbyId}`);
  const lobby = lobbyManager.joinLobby(clientId!, request.query.lobbyId);
  if (lobby.error) {
    connection.socket.send(lobby.error);
    connection.socket.close();
  } else {
    connection.socket.send(JSON.stringify(lobby));
    connection.socket.on(lobbyEvent.SEND_MESSAGE, (message) => {
      // console.log(clientId);
      // console.log(`Client message ${message}`);
      lobbyManager.sendMessageToLobby(clientId!, message.toString(), lobby.id);
    });
    connection.socket.on("close", () =>
      console.log(`${clientId} disconnected`)
    );
  }
};

export const createLobby = (connection: SocketStream) => {
  const quizId = "quizKek";
  const clientId = socketRegistry.getClientId(connection.socket);
  console.log(`hostId = ${clientId}`);
  const lobby = lobbyManager.createLobby(quizId, clientId!);
  if (lobby.error) {
    connection.socket.send(lobby.error);
    connection.socket.close();
  } else {
    connection.socket.send(JSON.stringify(lobby));
    connection.socket.on(lobbyEvent.SEND_MESSAGE, (message) => {
      lobbyManager.sendMessageToLobby(clientId!, message.toString(), lobby.id);
    });
  }
  connection.socket.on("close", () => console.log("Client disconnected"));
};
