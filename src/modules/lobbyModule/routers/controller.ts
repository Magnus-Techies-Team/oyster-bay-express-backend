import { FastifyReply, FastifyRequest } from "fastify";
import {
  RouteGenericInterfaceCreateLobby,
  RouteGenericInterfaceLobbyAction,
} from "../types/reqInterface";
import { lobbyEvent } from "../../../socket/types/lobbyEvent";
import { lobbyManager } from "../../../projectDependencies";

export const disconnectLobby = async (req: any, rep: FastifyReply) => {
  const clientId = req.query.clientId;
  const lobbyId = req.query.lobbyId;
  const lobby = lobbyManager.disconnectLobby(lobbyId, clientId);
  rep.status(200).send(lobby);
};

export const startLobby = async (req: any, rep: FastifyReply) => {
  const clientId = req.query.clientId;
  const lobbyId = req.query.lobbyId;
  const lobby = lobbyManager.startLobby(lobbyId, clientId);
  if (lobby.error) rep.status(400).send(lobby.error);
  else rep.status(200).send(lobby);
};
