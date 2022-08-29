export type createLobbyHandlerBody = {quizId: string};

export type defaultActionHandlerBody = {lobbyId: string}

export type chatMessageHandlerBody = defaultActionHandlerBody & {message: string};

export type questionHandlerBody = defaultActionHandlerBody & { questionId: string };

export type validateQuestionHandlerBody = defaultActionHandlerBody & { isRight: boolean };