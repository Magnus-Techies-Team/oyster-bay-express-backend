import { FastifyReply, FastifyRequest } from "fastify";
import {
  RouteGenericInterfaceCreateLobby,
  RouteGenericInterfaceLobbyAction,
} from "../types/reqInterface";
import server from "../../../server";
import { EventEmitter } from "events";
import { lobbyEvent } from "../../../socket/types/lobbyEvent";
import lobbyManager from "../../lobbyModule/utils/lobbyManager";
import socketRegistry from "../../../socket/socketRegistry";

// export const createLobby = async (
//     req: FastifyRequest,
//     rep: FastifyReply,
// ) => {
//   const body: any = req.body;
//   const lobby = lobbyManager.createLobby(body.quizId, body.hostId);
//   rep.status(200).send(lobby);
// };
//
// export const joinLobby = async (
//     req: FastifyRequest,
//     rep: FastifyReply,
// ) => {
//   const body: any = req.body;
//   const lobby = lobbyManager.joinLobby(body.clientId, body.lobbyId);
//   rep.status(200).send(lobby);
// };

export const disconnectLobby = async (req: any, rep: FastifyReply) => {
  const clientId = req.query.clientId;
  const lobbyId = req.query.lobbyId;
  const lobby = lobbyManager.disconnectLobby(lobbyId, clientId);
  rep.status(200).send(lobby);
};
