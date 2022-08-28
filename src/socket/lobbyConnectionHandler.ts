import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {
  createLobbyHandlerBody, defaultActionHandlerBody,
} from "~/socket/types/wsInterface";

export default class lobbyConnectionHandler {
  readonly #socket: WebSocket;
  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #createLobbyListener = (body: createLobbyHandlerBody) => {
    const hostId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.createLobby(body.quizId, <string>hostId);
    this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
  };

  readonly #joinLobbyListener = (body: defaultActionHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.joinLobby(<string>clientId, body.lobbyId);
    if (lobby && lobby.error)
      this.#socket.send(
        JSON.stringify(
          socketMessageManager.generateString({ error: lobby.error })
        )
      );
    else
      this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
  };

  init(): void {
    this.#socket.on(lobbyEvent.CREATE_LOBBY, this.#createLobbyListener);
    this.#socket.on(lobbyEvent.JOIN_LOBBY, this.#joinLobbyListener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.CREATE_LOBBY, this.#createLobbyListener);
    this.#socket.off(lobbyEvent.JOIN_LOBBY, this.#joinLobbyListener);
  }
}
