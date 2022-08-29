import { WebSocket } from "ws";
import { LobbyEvent } from "~/socket/types/lobbyEvent";
import { Lobby } from "~/modules/lobbyModule/types/lobby";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {defaultActionHandlerBody} from "~/socket/types/wsInterface";
import {LobbyMethod} from "~/socket/types/lobbyMethod";

export default class startHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #startListener = async (body: defaultActionHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.startLobby(body.lobbyId, <string>clientId);
    if (lobby && lobby.error)
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
  };

  readonly #listener = async (lobby: Lobby) => {
    this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
  };

  init(): void {
    this.#socket.on(LobbyMethod.START_LOBBY, this.#startListener);
    this.#socket.on(LobbyEvent.START, this.#listener);
  }

  destroy(): void {
    this.#socket.off(LobbyMethod.START_LOBBY, this.#startListener);
    this.#socket.off(LobbyEvent.START, this.#listener);
  }
}
