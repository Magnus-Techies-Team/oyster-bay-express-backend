export type questionHandlerBody = {
  lobbyId: string;
  clientId: string;
};

export type createLobbyHandlerBody = {
  quizId: string;
  hostId: string;
};

export type joinLobbyHandlerBody = {
  lobbyId: string;
  clientId: string;
};

export type chatActionHandlerBody = {
  lobbyId: string;
  clientId: string;
  message: string;
};
