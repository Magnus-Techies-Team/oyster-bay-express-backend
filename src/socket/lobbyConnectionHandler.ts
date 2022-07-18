import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import { lobbyManager, socketMessageManager } from "~/projectDependencies";

export default class lobbyConnectionHandler {
  readonly #socket: WebSocket;
  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #createLobbyListener = (body: {
    quizId: string;
    hostId: string;
  }) => {
    const lobby = lobbyManager.createLobby(body.quizId, body.hostId);
    this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
  };

  readonly #joinLobbyListener = (body: {
    clientId: string;
    lobbyId: string;
  }) => {
    const lobby = lobbyManager.joinLobby(body.clientId, body.lobbyId);
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
