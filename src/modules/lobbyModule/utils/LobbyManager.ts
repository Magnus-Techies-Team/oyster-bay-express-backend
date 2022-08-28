import {
  ANSWER_QUESTION_TIMEOUT,
  disconnectLobbyStatus,
  gameStatus,
  joinLobbyStatus,
  lobbyCondition,
  lobbyStatus,
  MAX_PLAYER_COUNT,
  MIN_PLAYER_COUNT,
  QUESTION_CANCEL_TIMEOUT,
  questionStatus,
  startLobbyStatus,
  userState,
  userStatus,
  validateStatus,
} from "../types/lobbyConstants";
import {EventEmitter} from "events";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {lobbyEvent} from "~/socket/types/lobbyEvent";
import TimeoutTimer from "~/utils/TimeoutTimer";
import {chatMessageHandlerBody, questionHandlerBody, validateQuestionHandlerBody,} from "~/socket/types/wsInterface";
import {uuid} from "uuidv4";
import {userManager} from "~/projectDependencies";
import {ExtendedUserInfo} from "~/modules/lobbyModule/types/User";

export type clientEventHandler = (clientId: string) => void;

export default class LobbyManager {
  #event = new EventEmitter();
  #playersToAnswer = new TimeoutTimer(ANSWER_QUESTION_TIMEOUT);
  #questionsToCancel = new TimeoutTimer(QUESTION_CANCEL_TIMEOUT);
  readonly #lobbies = new Map<string, Lobby>();

  #emitEventForLobby(lobby: Lobby, event: lobbyEvent, ...args: any[]) {
    const users = [lobby.host.user_id , ...lobby.users.keys()];
    for (const userId of users) {
      this.#event.emit(event, userId, ...args);
    }
  }

  getLobby(lobbyId?: string): Lobby | any {
    let result;
    if (lobbyId) result = this.#lobbies.get(lobbyId);
    else result = this.#lobbies;
    if (!result) return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    else return result;
  }

  async createLobby(quizId: string, hostId: string): Promise<any> {
    const lobbyId = uuid();
    for (const lobby of this.#lobbies.values())
      if (lobby.host.user_id === hostId)
        return { error: joinLobbyStatus.ALREADY_IN_GAME } as any;
    const host = await userManager.getUser(hostId);
    this.#lobbies.set(lobbyId, {
      id: lobbyId,
      host: {user_id: hostId, user_name: host.login, state: userState.CONNECTED, status: userStatus.HOST},
      users: new Map<string, ExtendedUserInfo>(),
      quizId: quizId,
      maxPlayers: MAX_PLAYER_COUNT,
      state: lobbyStatus.WAITING,
      currentRound: undefined,
      currentQuestion: undefined,
      quiz: undefined,
      assignee: undefined,
    });
    return this.#lobbies.get(lobbyId);
  }

  async joinLobby(clientId: string, lobbyId: string): Promise<any> {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === clientId) {
      return { error: joinLobbyStatus.HOST_IN_GAME } as any;
    }
    if (lobby.users.has(clientId)) {
      return { error: joinLobbyStatus.ALREADY_JOINED } as any;
    }
    if (lobby.users.size === lobby.maxPlayers) {
      return { error: joinLobbyStatus.LOBBY_IS_FULL } as any;
    }
    if (lobby.state === lobbyStatus.STARTED) {
      return { error: joinLobbyStatus.GAME_ALREADY_STARTED} as any;
    }
    const user = await userManager.getUser(clientId);
    lobby.users.set(clientId, {user_id: clientId, user_name: user.login, points: 0, status: userStatus.PLAYER, state: userState.CONNECTED});
    this.#emitEventForLobby(lobby, lobbyEvent.USER_JOIN, lobby);
    // return lobby;
  }

  public disconnectLobby(lobbyId: string, clientId: string): void | any {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: disconnectLobbyStatus.GAME_NOT_FOUND };
    }
    if (clientId === lobby.host.user_id) {
      for (const userId of lobby.users.keys()) {
        this.#event.emit(lobbyEvent.HOST_DISCONNECT, userId);
      }
      this.#event.emit(lobbyEvent.DISCONNECT, lobby);
      this.#lobbies.delete(lobbyId);
      return { message: `Lobby with id ${lobbyId} deleted.` };
    } else if (lobby.users.has(clientId)) {
      lobby.users.delete(clientId);
      this.#event.emit(lobbyEvent.DISCONNECT, clientId);
      this.#emitEventForLobby(lobby, lobbyEvent.USER_DISCONNECT, lobby);
      return lobby;
    } else {
      return { error: disconnectLobbyStatus.USER_NOT_FOUND } as any;
    }
  }

  public startLobby(lobbyId: string, clientId: string): Lobby | any {
    const lobby = this.#lobbies.get(lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id !== clientId) {
      return { error: startLobbyStatus.NOT_HOST } as any;
    }
    if (lobby.users.size < MIN_PLAYER_COUNT) {
      return { error: startLobbyStatus.NOT_ENOUGH_PLAYERS } as any;
    }
    lobby.state = lobbyStatus.STARTED;
    lobby.currentRound = 0;
    lobby.condition = lobbyCondition.PLAYER_CHOOSES_QUESTION;
    this.#emitEventForLobby(lobby, lobbyEvent.START, lobby);
  }

  public sendMessageToLobby(body: chatMessageHandlerBody & {clientId: string}): void {
    const lobby = this.#lobbies.get(body.lobbyId);
    this.#emitEventForLobby(
      <Lobby>lobby,
      lobbyEvent.RECEIVE_MESSAGE,
      body.clientId,
      body.message
    );
  }

  public setQuestion(
    body: questionHandlerBody & { clientId: string }
  ): void | any {
    const lobby = this.#lobbies.get(body.lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id !== body.clientId) {
      return { error: startLobbyStatus.NOT_HOST } as any;
    }
    lobby.condition = lobbyCondition.PLAYERS_TAKE_QUESTION;
    // TODO: set current question
    // lobby.currentQuestion
  }

  public takeQuestion(body: questionHandlerBody & {clientId: string}): void | any {
    const lobby = this.#lobbies.get(body.lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === body.clientId) {
      return { error: gameStatus.NO_HOST_QUESTION } as any;
    }
    if (lobby.currentQuestion === undefined) {
      return { error: gameStatus.NO_ACTIVE_QUESTION } as any;
    }
    if (lobby.assignee) {
      return { error: gameStatus.QUESTION_ALREADY_TAKEN } as any;
    }
    lobby.currentQuestion!.questionStatus = questionStatus.ACTIVE;
    lobby.assignee = body.clientId;
    lobby.condition = lobbyCondition.HOST_VALIDATES_ANSWER;
    this.#emitEventForLobby(lobby, lobbyEvent.TAKE_QUESTION, lobby);
  }

  public validateAnswer(body: validateQuestionHandlerBody & { clientId: string }): any {
    const lobby = this.#lobbies.get(body.lobbyId);
    if (!lobby) {
      return { error: joinLobbyStatus.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === body.clientId) {
      return { error: gameStatus.NO_HOST_QUESTION } as any;
    }
    if (lobby.assignee === undefined) {
      return { error: gameStatus.NO_ACTIVE_QUESTION } as any;
    }
    const user = lobby.users.get(lobby.assignee);
    if (body.isRight === validateStatus.CORRECT)
      user!.points += lobby.currentQuestion!.cost;
    else {
      user!.points -= lobby.currentQuestion!.cost;
      lobby.assignee = LobbyManager.#getNextAssignee(lobby.users, lobby.assignee);
    }

    const actionInfo = {
      playerId: lobby.assignee,
      questionId: lobby.currentQuestion!.id,
      playerScore: lobby.users.get(<string>lobby.assignee),
      isRight: body.isRight,
    };
    lobby.currentQuestion!.questionStatus = questionStatus.TAKEN;
    lobby.condition = lobbyCondition.PLAYER_CHOOSES_QUESTION;
    lobby.currentQuestion = undefined;
    // TODO: check, if last question, then emit event for next round
    // TODO: check for end of game
    this.#emitEventForLobby(lobby, lobbyEvent.HOST_VALIDATED_ANSWER, lobby, actionInfo);
  }

  static #getNextAssignee(users: Map<any, any>, current: string) {
    let counter;
    const ids = Array.from(users.keys());
    if (ids.indexOf(current) === ids.length - 1) counter = 0;
    else counter = (ids.indexOf(current)) + 1;
    return ids[counter];
  }

  onJoin(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.USER_JOIN, handler);
  }

  onDisconnect(handler: clientEventHandler): void {
    this.#event.on(lobbyEvent.DISCONNECT, handler);
  }

  onUserDisconnect(
    handler: (clientId: string, deletedClientId: string) => void
  ): void {
    this.#event.on(lobbyEvent.USER_DISCONNECT, handler);
  }

  onHostDisconnect(handler: clientEventHandler): void {
    this.#event.on(lobbyEvent.HOST_DISCONNECT, handler);
  }

  onChat(
    handler: (clientId: string, senderId: string, message: string) => void
  ): void {
    this.#event.on(lobbyEvent.RECEIVE_MESSAGE, handler);
  }

  onStart(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.START, handler);
  }

  onSetQuestion(handler: (clientId: string, lobby: Lobby) => void):void {
    this.#event.on(lobbyEvent.SET_QUESTION, handler);
  }

  onTakeQuestion(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.TAKE_QUESTION, handler);
  }

  onAnswerQuestion(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.ANSWER_QUESTION, handler);
  }

  onSwitchRound(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.SWITCH_ROUND, handler);
  }

  onEndLobby(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(lobbyEvent.END_LOBBY, handler);
  }
}
