import {validateStatus} from "~/modules/lobbyModule/types/lobbyConstants";

export type createLobbyHandlerBody = {quizId: string};

export type defaultActionHandlerBody = {lobbyId: string}

export type chatMessageHandlerBody = defaultActionHandlerBody & {message: string};

export type questionHandlerBody = defaultActionHandlerBody & { questionId: string };

export type answerQuestionHandlerBody = defaultActionHandlerBody & { answer: string };

export type validateQuestionHandlerBody = defaultActionHandlerBody & { isRight: validateStatus };