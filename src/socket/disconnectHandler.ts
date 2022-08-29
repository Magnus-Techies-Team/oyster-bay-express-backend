import { WebSocket } from "ws";
import { LobbyEvent } from "~/socket/types/lobbyEvent";
import { socketRegistry } from "~/projectDependencies";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {socketMessageManager} from "~/projectDependencies";

export default class disconnectHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #disconnectListener = async () => {
    socketRegistry.remove(this.#socket);
  };

  readonly #userDisconnectListener = (body: Lobby) => {
    this.#socket.send(socketMessageManager.generateString({lobby: body}));
  };

  readonly #hostDisconnectListener = async () => {
    socketRegistry.remove(this.#socket);
    this.#socket.send("Host has left. Leaving lobby");
    this.#socket.close();
  };

  init(): void {
    this.#socket.on(LobbyEvent.DISCONNECT, this.#disconnectListener);
    this.#socket.on(LobbyEvent.HOST_DISCONNECT, this.#hostDisconnectListener);
    this.#socket.on(LobbyEvent.USER_DISCONNECT, this.#userDisconnectListener);
  }

  destroy(): void {
    this.#socket.off(LobbyEvent.DISCONNECT, this.#disconnectListener);
    this.#socket.off(LobbyEvent.HOST_DISCONNECT, this.#hostDisconnectListener);
    this.#socket.off(LobbyEvent.USER_DISCONNECT, this.#userDisconnectListener);
  }
}
