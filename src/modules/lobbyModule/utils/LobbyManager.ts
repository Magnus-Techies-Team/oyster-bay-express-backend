import {
  ANSWER_QUESTION_TIMEOUT,
  lobbyCondition,
  lobbyStatus,
  MAX_PLAYER_COUNT,
  MIN_PLAYER_COUNT,
  QUESTION_CANCEL_TIMEOUT,
  questionStatus,
  userState,
  userStatus,
} from "../types/lobbyConstants";
import {EventEmitter} from "events";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {LobbyEvent} from "~/socket/types/lobbyEvent";
import TimeoutTimer from "~/utils/TimeoutTimer";
import {
  chatMessageHandlerBody,
  defaultActionHandlerBody,
  questionHandlerBody,
  validateQuestionHandlerBody,
} from "~/socket/types/wsInterface";
import {uuid} from "uuidv4";
import {quizManager, userManager} from "~/projectDependencies";
import {Question} from "../types/Question";
import {ExtendedUserInfo} from "~/modules/lobbyModule/types/User";
import {ErrorConstants} from "../types/errorConstants";

export type clientEventHandler = (clientId: string) => void;

export type ActionInfo = {
  playerId: string,
  questionId: string,
  playerScore: number,
  isRight: boolean,
};

export default class LobbyManager {
  #event = new EventEmitter();
  #playersToAnswer = new TimeoutTimer(ANSWER_QUESTION_TIMEOUT);
  #questionsToCancel = new TimeoutTimer(QUESTION_CANCEL_TIMEOUT);
  readonly #lobbies: {[key:string]:Lobby} = {};

  #emitEventForLobby(lobby: Lobby, event: LobbyEvent, ...args: any[]) {
    const users = [lobby.host.user_id , ...Object.keys(lobby.users), ...[lobby.spectators]];
    for (const userId of users) {
      this.#event.emit(event, userId, ...args);
    }
  }

  getLobby(lobbyId?: string): {[key:string]:Lobby} | Lobby | any {
    let result;
    if (lobbyId) result = this.#lobbies[lobbyId];
    else result = this.#lobbies;
    if (!result) return { error: ErrorConstants.GAME_NOT_FOUND } as any;
    else return result;
  }

  async createLobby(quizId: string, hostId: string): Promise<any> {
    const lobbyId = uuid();
    // const lobbyId = "06c7547f-31f6-4875-8b18-1be5fbe44d00";
    for (const id in this.#lobbies)
      if (this.#lobbies[id].host.user_id === hostId)
        return { error: ErrorConstants.ALREADY_IN_GAME } as any;
    const host = await userManager.getUser(hostId);
    const quiz = await quizManager.getQuizQuestions(hostId, quizId);
    if (quiz.error) {
      return { error: ErrorConstants.QUIZ_NOT_FOUND } as any;
    }
    this.#lobbies[lobbyId] = {
      id: lobbyId,
      host: {user_id: hostId, user_name: host.login, state: userState.CONNECTED, status: userStatus.HOST},
      users: {},
      spectators: {},
      quizId: quizId,
      maxPlayers: MAX_PLAYER_COUNT,
      state: lobbyStatus.WAITING,
      quiz: { title: quiz.title, rounds: quiz.rounds},
      currentRound: undefined,
      currentQuestion: undefined,
      assignee: undefined,
    };
    return this.#lobbies[lobbyId];
  }

  async spectateLobby(body: defaultActionHandlerBody & {clientId: string}): Promise<any> {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: ErrorConstants.GAME_NOT_FOUND } as any;
    }
    else if (lobby.host.user_id === body.clientId) {
      return { error: ErrorConstants.HOST_IN_GAME } as any;
    }
    else if (lobby.users[body.clientId]) {
      return { error: ErrorConstants.ALREADY_JOINED } as any;
    } else {
      const user = await userManager.getUser(body.clientId);
      lobby.spectators[body.clientId] = ({user_id: body.clientId, user_name: user.login, state: userState.CONNECTED, status: userStatus.SPECTATOR});
      return lobby;
    }
  }

  async joinLobby(clientId: string, lobbyId: string): Promise<any> {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) {
      return { error: ErrorConstants.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === clientId) {
      return { error: ErrorConstants.HOST_IN_GAME } as any;
    }
    if (lobby.users[clientId]) {
      return { error: ErrorConstants.ALREADY_JOINED } as any;
    }
    if (Object.keys(lobby.users).length === lobby.maxPlayers) {
      return { error: ErrorConstants.LOBBY_IS_FULL } as any;
    }
    if (lobby.state === lobbyStatus.STARTED) {
      return { error: ErrorConstants.GAME_ALREADY_STARTED} as any;
    }
    const user = await userManager.getUser(clientId);
    lobby.users[clientId] = {user_id: clientId, user_name: user.login, points: 0, status: userStatus.PLAYER, state: userState.CONNECTED};
    if (lobby.spectators[clientId]) delete lobby.spectators[clientId];
    this.#emitEventForLobby(lobby, LobbyEvent.USER_JOIN, lobby);
  }

  public disconnectLobby(lobbyId: string, clientId: string): void | any {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) {
      return { error: ErrorConstants.GAME_NOT_FOUND };
    }
    if (clientId === lobby.host.user_id) {
      for (const userId in lobby.users) {
        this.#event.emit(LobbyEvent.HOST_DISCONNECT, userId);
      }
      this.#event.emit(LobbyEvent.DISCONNECT, lobby);
      delete this.#lobbies[lobbyId];
    } else if (lobby.users[clientId]) {
      delete lobby.users[clientId];
      this.#event.emit(LobbyEvent.DISCONNECT, clientId);
      this.#emitEventForLobby(lobby, LobbyEvent.USER_DISCONNECT, lobby);
    } else {
      return { error: ErrorConstants.USER_NOT_FOUND } as any;
    }
  }

  public startLobby(lobbyId: string, clientId: string): Lobby | any {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) {
      return { error: ErrorConstants.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id !== clientId) {
      return { error: ErrorConstants.NOT_HOST } as any;
    }
    if (Object.keys(lobby.users).length < MIN_PLAYER_COUNT) {
      return { error: ErrorConstants.NOT_ENOUGH_PLAYERS } as any;
    }
    if (!lobby.quiz || !lobby.quizId) {
      return { error: ErrorConstants.NO_QUIZ_PASSED } as any;
    }
    if (lobby.state === lobbyStatus.STARTED) {
      return { error: ErrorConstants.GAME_ALREADY_STARTED } as any;
    }
    if (lobby.assignee) lobby.assignee = undefined;
    lobby.state = lobbyStatus.STARTED;
    lobby.currentRound = 1;
    lobby.condition = lobbyCondition.PLAYER_CHOOSES_QUESTION;
    lobby.assignee = LobbyManager.#getNextAssignee(lobby.users, lobby.assignee);
    this.#emitEventForLobby(lobby, LobbyEvent.START, lobby);
  }

  public sendMessageToLobby(body: chatMessageHandlerBody & {clientId: string}): void {
    const lobby = this.#lobbies[body.lobbyId];
    this.#emitEventForLobby(
      <Lobby>lobby,
      LobbyEvent.RECEIVE_MESSAGE,
      body.clientId,
      body.message
    );
  }

  public setQuestion(
    body: questionHandlerBody & { clientId: string }
  ): void | any {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: ErrorConstants.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id !== body.clientId) {
      return { error: ErrorConstants.NOT_HOST } as any;
    }
    if (!lobby.quiz) {
      return { error: ErrorConstants.NO_QUIZ_PASSED } as any;
    }
    if (lobby.currentQuestion) return { error: ErrorConstants.QUESTION_ALREADY_TAKEN } as any;
    if (!lobby.currentRound) {
      lobby.currentRound = 1;
    }
    lobby.condition = lobbyCondition.PLAYERS_TAKE_QUESTION;
    const question  = lobby.quiz.rounds[lobby.currentRound].find((qs: any) => qs.id === body.questionId);
    if (!question) {
      return { error: ErrorConstants.NO_QUESTION_FOUND } as any;
    }
    if (question.questionStatus !== questionStatus.NOT_TAKEN) return { error: ErrorConstants.QUESTION_ALREADY_TAKEN } as any;
    if (lobby.assignee !== undefined) lobby.assignee = undefined;
    lobby.currentQuestion = question;
    lobby.currentQuestion.questionStatus = questionStatus.ACTIVE;
    lobby.condition = lobbyCondition.PLAYERS_TAKE_QUESTION;
    this.#emitEventForLobby(lobby, LobbyEvent.HOST_SET_QUESTION, lobby);
  }

  public takeQuestion(body: defaultActionHandlerBody & {clientId: string}): void | any {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: ErrorConstants.GAME_NOT_FOUND } as any;
    }
    if (lobby.host.user_id === body.clientId) {
      return { error: ErrorConstants.NO_HOST_QUESTION } as any;
    }
    if (lobby.currentQuestion === undefined) {
      return { error: ErrorConstants.NO_ACTIVE_QUESTION } as any;
    }
    if (lobby.assignee) {
      return { error: ErrorConstants.ALREADY_ACTIVE_PLAYER_EXIST } as any;
    }
    lobby.currentQuestion!.questionStatus = questionStatus.ACTIVE;
    lobby.assignee = body.clientId;
    lobby.condition = lobbyCondition.HOST_VALIDATES_ANSWER;
    this.#emitEventForLobby(lobby, LobbyEvent.PLAYER_TAKE_QUESTION, lobby);
  }

  public validateAnswer(body: validateQuestionHandlerBody & { clientId: string }): any {
    const lobby = this.#lobbies[body.lobbyId];
    if (!lobby) {
      return { error: ErrorConstants.GAME_NOT_FOUND } as any;
    }
    if (lobby.assignee === undefined || lobby.currentQuestion === undefined) {
      return { error: ErrorConstants.NO_ACTIVE_QUESTION } as any;
    }
    const user = lobby.users[lobby.assignee];
    if (body.isRight)
      user!.points += lobby.currentQuestion!.cost;
    else {
      user!.points -= lobby.currentQuestion!.cost;
      lobby.assignee = LobbyManager.#getNextAssignee(lobby.users, lobby.assignee);
    }
    const actionInfo: ActionInfo = {
      playerId: lobby.assignee,
      questionId: lobby.currentQuestion!.id,
      playerScore: lobby.users[<string>lobby.assignee].points,
      isRight: body.isRight,
    };
    lobby.currentQuestion!.questionStatus = questionStatus.TAKEN;
    lobby.condition = lobbyCondition.PLAYER_CHOOSES_QUESTION;
    lobby.currentQuestion = undefined;
    this.#emitEventForLobby(lobby, LobbyEvent.HOST_VALIDATED_ANSWER, {lobby, actionInfo});
    if (lobby.quiz.rounds[lobby.currentRound!].every((q: Question) => q.questionStatus !== questionStatus.NOT_TAKEN)) {
      lobby.currentRound!++;
      this.#emitEventForLobby(lobby, LobbyEvent.SWITCH_ROUND, {lobby: lobby});
    }
    if (lobby.currentRound! > Number(Object.keys(lobby.quiz.rounds)["length"])) {
      lobby.state = lobbyStatus.ENDED;
      const users = Object.values(lobby.users);
      const winner = users.reduce((prev, curr) => prev.points > curr.points ? prev : curr);
      this.#emitEventForLobby(lobby, LobbyEvent.END_LOBBY, {lobby, winner});
      delete this.#lobbies[body.lobbyId];
    }
  }

  static #getNextAssignee(users: {[key: string]: ExtendedUserInfo}, current: string | undefined) {
    let counter;
    const ids = Object.keys(users);
    if (current === undefined) return ids[0];
    if (ids.indexOf(current) === ids.length - 1) counter = 0;
    else counter = (ids.indexOf(current)) + 1;
    return ids[counter];
  }

  onJoin(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(LobbyEvent.USER_JOIN, handler);
  }

  onDisconnect(handler: clientEventHandler): void {
    this.#event.on(LobbyEvent.DISCONNECT, handler);
  }

  onUserDisconnect(
    handler: (clientId: string, deletedClientId: string) => void
  ): void {
    this.#event.on(LobbyEvent.USER_DISCONNECT, handler);
  }

  onHostDisconnect(handler: clientEventHandler): void {
    this.#event.on(LobbyEvent.HOST_DISCONNECT, handler);
  }

  onChat(
    handler: (clientId: string, senderId: string, message: string) => void
  ): void {
    this.#event.on(LobbyEvent.RECEIVE_MESSAGE, handler);
  }

  onStart(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(LobbyEvent.START, handler);
  }

  onSetQuestion(handler: (clientId: string, lobby: Lobby) => void):void {
    this.#event.on(LobbyEvent.HOST_SET_QUESTION, handler);
  }

  onTakeQuestion(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(LobbyEvent.PLAYER_TAKE_QUESTION, handler);
  }

  onValidatedAnswer(handler: (clientId: string, lobby: Lobby, actionInfo: ActionInfo) => void): void {
    this.#event.on(LobbyEvent.HOST_VALIDATED_ANSWER, handler);
  }

  onSwitchRound(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(LobbyEvent.SWITCH_ROUND, handler);
  }

  onEndLobby(handler: (clientId: string, lobby: Lobby) => void): void {
    this.#event.on(LobbyEvent.END_LOBBY, handler);
  }
}
