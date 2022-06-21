import { WebSocket } from "ws";

class SocketRegistry {
  readonly #socketByClientId = new Map<string, WebSocket>();
  readonly #clientIdBySocket = new Map<WebSocket, string>();

  add(socket: WebSocket, clientId: string) {
    this.#socketByClientId.set(clientId, socket);
    this.#clientIdBySocket.set(socket, clientId);
  }

  remove(socket: WebSocket) {
    const clientId = this.getClientId(socket);
    if (clientId) {
      this.#socketByClientId.delete(clientId);
      this.#clientIdBySocket.delete(socket);
    }
  }

  getClientId(socket: WebSocket) {
    return this.#clientIdBySocket.get(socket);
  }

  getSocket(clientId: string) {
    return this.#socketByClientId.get(clientId);
  }
}

export default new SocketRegistry();
