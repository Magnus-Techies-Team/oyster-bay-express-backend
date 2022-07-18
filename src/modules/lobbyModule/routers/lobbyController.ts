import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { socketRegistry, lobbyManager } from "~/projectDependencies";
import { RouteGenericInterfaceLobbyAction } from "~/modules/lobbyModule/types/reqInterface";
import { lobbyEvent } from "~/socket/types/lobbyEvent";

export const setConnection = (
  connection: SocketStream,
  request: FastifyRequest
): void => {
  // let counter = 0;
  // const clientIds = [
  //   "cf38d00f-35e0-4032-88cf-9b45980d9e3d",
  //   "1ecc3dc4-2c44-4534-9034-ed5cc026c8b2",
  //   "4101e92e-0382-4acf-a162-80cddda92a58",
  //   "cc95d2b0-82fb-45f8-88a2-2da7796e696c",
  // ];
  const clientId = <string>request.headers.client_id;
  socketRegistry.add(connection.socket, clientId);
  // connection.socket.on("close", () => {
  //   lobbyManager.disconnectLobby(request.cookies["clientId"]);
  // });
};

export const joinLobby = (
  connection: SocketStream,
  request: FastifyRequest<RouteGenericInterfaceLobbyAction>
): void => {
  const clientId = socketRegistry.getClientId(connection.socket);
  console.log(`lobbyId = ${request.query.lobbyId}`);
  const lobby = lobbyManager.joinLobby(<string>clientId, request.query.lobbyId);
  if (lobby.error) {
    connection.socket.send(lobby.error);
    connection.socket.close();
  } else {
    connection.socket.send(JSON.stringify(lobby));
    connection.socket.on(lobbyEvent.SEND_MESSAGE, (message) => {
      lobbyManager.sendMessageToLobby(
        <string>clientId,
        message.toString(),
        lobby.id
      );
    });
    connection.socket.on("close", () =>
      console.log(`${clientId} disconnected`)
    );
  }
};

// export const createLobby = (connection: SocketStream): void => {
//   const quizId = "quizKek";
//   const clientId = socketRegistry.getClientId(connection.socket);
//   console.log(`hostId = ${clientId}`);
//   const lobby = lobbyManager.createLobby(quizId, <string>clientId);
//   if (lobby.error) {
//     connection.socket.send(lobby.error);
//     connection.socket.close();
//   } else {
//     connection.socket.send(JSON.stringify(lobby));
//     connection.socket.on(lobbyEvent.SEND_MESSAGE, (message) => {
//       lobbyManager.sendMessageToLobby(
//         <string>clientId,
//         message.toString(),
//         lobby.id
//       );
//     });
//   }
//   connection.socket.on("close", () => console.log("Client disconnected"));
// };
