import { WebSocket } from "ws";

export default class SocketRegistry {
  readonly #socketByClientId = new Map<string, WebSocket>();
  readonly #clientIdBySocket = new Map<WebSocket, string>();

  add(socket: WebSocket, clientId: string): void {
    this.#socketByClientId.set(clientId, socket);
    this.#clientIdBySocket.set(socket, clientId);
  }

  remove(socket: WebSocket): void {
    const clientId = this.getClientId(socket);
    if (clientId) {
      this.#socketByClientId.delete(clientId);
      this.#clientIdBySocket.delete(socket);
      socket.close();
    }
  }

  getClientId(socket: WebSocket): string | undefined {
    return this.#clientIdBySocket.get(socket);
  }

  getSocket(clientId: string): WebSocket | undefined {
    return this.#socketByClientId.get(clientId);
  }
}
