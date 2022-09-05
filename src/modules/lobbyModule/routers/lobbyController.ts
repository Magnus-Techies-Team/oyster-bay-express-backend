import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import {lobbyManager, socketMessageManager, socketRegistry /*,lobbyManager*/} from "~/projectDependencies";

export const setConnection = (
  connection: SocketStream,
  request: FastifyRequest
): void => {
  const clientId = <string>request.cookies.uuid;
  socketRegistry.add(connection.socket, clientId);
  const lobbies = lobbyManager.getLobby();
  for (const lobbyId in lobbies)
    if (
      lobbies[lobbyId].host.user_id === request.cookies.uuid || 
        lobbies[lobbyId].users[clientId] ||
        lobbies[lobbyId].spectators[clientId]
    ) return connection.socket.send(socketMessageManager.generateString({lobby: lobbies[lobbyId], currentUser: lobbyManager.getUser(lobbies[lobbyId], clientId)}, ));
  connection.socket.send(socketMessageManager.generateString({connection: "Established"}));
  // connection.socket.on("close", () => {
  //   lobbyManager.disconnectLobby(clientId);
  // });
};
