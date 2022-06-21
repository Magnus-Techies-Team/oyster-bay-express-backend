import { Lobby } from "../types/lobby";
import {
  disconnectLobbyStatus,
  joinLobbyStatus,
  MAX_PLAYER_COUNT,
} from "../types/lobbyConstants";
import { EventEmitter } from "events";
import { lobbyEvent } from "../../../socket/types/lobbyEvent";

export type clientEventHandler = (clientId: string) => void;

export default new (class lobbyManager {
  #event = new EventEmitter();
  readonly #lobbies = new Map<string, Lobby>();

  #emitEventForLobby(lobby: Lobby, event: lobbyEvent, ...args: any[]) {
    const users = [{ id: lobby.hostId }, ...lobby.users];
    // this.#event.emit(event, lobby.hostId, ...args);
    for (let user of users) {
      this.#event.emit(event, user.id, ...args);
    }
  }

  createLobby(quizId: string, hostId: string) {
    // const lobbyId = uuid();
    for (let lobby of this.#lobbies.values())
      if (lobby.hostId === hostId)
        return { error: joinLobbyStatus.ALREADY_IN_GAME } as any;
    const lobbyId = "41d524a8-d2ef-4677-9dc9-0e5d949ff048";
    this.#lobbies.set(lobbyId, {
      id: lobbyId,
      hostId: hostId,
      users: [],
      quizId: quizId,
      maxPlayers: MAX_PLAYER_COUNT,
    });
    return this.#lobbies.get(lobbyId);
  }

  joinLobby(clientId: string, lobbyId: string) {
    // TODO: check, if user is valid via UUID
    console.log(this.#lobbies);
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.hostId === clientId) {
      return { error: joinLobbyStatus.HOST_IN_GAME } as any;
    }
    if (lobby.users.some((user) => user.id === clientId)) {
      return { error: joinLobbyStatus.ALREADY_JOINED } as any;
    }
    if (lobby.users.length === lobby.maxPlayers) {
      return { error: joinLobbyStatus.LOBBY_IS_FULL } as any;
    }
    // this.#event.emit(lobbyEvent.JOIN, lobby.hostId, clientId);
    // for (let user of lobby.users) {
    //     this.#event.emit(lobbyEvent.JOIN, user.id, clientId);
    // }
    this.#emitEventForLobby(lobby, lobbyEvent.JOIN, clientId);
    lobby.users.push({ id: clientId, points: 0 });
    return lobby;
  }

  disconnectLobby(lobbyId: string, clientId: string) {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: disconnectLobbyStatus.GAME_NOT_FOUND };
    }
    if (clientId === lobby.hostId) {
      for (let user of lobby.users) {
        this.#event.emit(lobbyEvent.HOST_DISCONNECT, user.id);
      }
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#lobbies.delete(lobbyId);
      return { message: `Lobby with id ${lobbyId} deleted.` };
    } else if (lobby.users.some((user) => user.id === clientId)) {
      lobby.users = lobby.users.filter((user) => user.id !== clientId);
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#event.emit(lobbyEvent.USER_DISCONNECT, lobby.hostId, clientId);
      for (let user of lobby.users) {
        this.#event.emit(lobbyEvent.USER_DISCONNECT, user.id, clientId);
      }
      return lobby;
    } else {
      return { error: disconnectLobbyStatus.USER_NOT_FOUND };
    }
  }

  public sendMessageToLobby(
    senderId: string,
    message: string,
    lobbyId: string
  ) {
    const lobby = this.#lobbies.get(lobbyId);
    // this.#event.emit(lobbyEvent.RECEIVE_MESSAGE, lobby!.hostId, senderId, message);
    // for (let user of lobby!.users) {
    //     this.#event.emit(lobbyEvent.RECEIVE_MESSAGE, user.id, senderId, message);
    // }
    this.#emitEventForLobby(
      lobby!,
      lobbyEvent.RECEIVE_MESSAGE,
      senderId,
      message
    );
  }

  onJoin(handler: (clientId: string, newClientId: string) => void) {
    this.#event.on(lobbyEvent.JOIN, handler);
  }

  onDisconnect(handler: clientEventHandler) {
    this.#event.on(lobbyEvent.DISCONNECT, handler);
  }

  onUserDisconnect(
    handler: (clientId: string, deletedClientId: string) => void
  ) {
    this.#event.on(lobbyEvent.USER_DISCONNECT, handler);
  }

  onHostDisconnect(handler: clientEventHandler) {
    this.#event.on(lobbyEvent.HOST_DISCONNECT, handler);
  }

  onChat(
    handler: (clientId: string, senderId: string, message: string) => void
  ) {
    this.#event.on(lobbyEvent.RECEIVE_MESSAGE, handler);
  }
})();
