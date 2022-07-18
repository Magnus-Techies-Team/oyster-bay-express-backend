import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import { Lobby } from "~/modules/lobbyModule/types/lobby";
import { lobbyManager, socketMessageManager } from "~/projectDependencies";

export default class startHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #startListener = async (lobbyId: string, clientId: string) => {
    const lobby = lobbyManager.startLobby(lobbyId, clientId);
    if (lobby.error)
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
  };

  readonly #listener = async (lobby: Lobby) => {
    this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
  };

  init(): void {
    this.#socket.on(lobbyEvent.START_LOBBY, this.#startListener);
    this.#socket.on(lobbyEvent.START, this.#listener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.START_LOBBY, this.#startListener);
    this.#socket.off(lobbyEvent.START, this.#listener);
  }
}
