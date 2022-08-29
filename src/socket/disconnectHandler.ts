import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
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
    this.#socket.on(lobbyEvent.DISCONNECT, this.#disconnectListener);
    this.#socket.on(lobbyEvent.HOST_DISCONNECT, this.#hostDisconnectListener);
    this.#socket.on(lobbyEvent.USER_DISCONNECT, this.#userDisconnectListener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.DISCONNECT, this.#disconnectListener);
    this.#socket.off(lobbyEvent.HOST_DISCONNECT, this.#hostDisconnectListener);
    this.#socket.off(lobbyEvent.USER_DISCONNECT, this.#userDisconnectListener);
  }
}
