import { FastifyReply, FastifyRequest } from "fastify";
import {
  RouteGenericInterfaceCreateUser,
  RouteGenericInterfaceLogin,
} from "~/modules/usersModule/types/reqInterface";
import { userManager } from "~/projectDependencies";
import { sign } from "jsonwebtoken";
import { ErrorConstraints } from "~/constraints/errorConstraints";

export const createUser = async (
  req: FastifyRequest<RouteGenericInterfaceCreateUser>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const user = await userManager.createUser(req.body);
  if (user.error) {
    return rep.status(400).send(user.error);
  }
  return rep.status(200).send(user);
};

export const login = async (
  req: FastifyRequest<RouteGenericInterfaceLogin>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const user = await userManager.login(req.body);
  console.log(user);
  if (user.error) {
    return rep.status(400).send(user.error);
  }
  const jwt = sign(user, <string>process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: 21600,
  });
  const acc = sign(user, <string>process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 300,
  });
  rep.setCookie("ref", jwt, { httpOnly: true });
  rep.setCookie("acc", acc, { httpOnly: true });
  return rep.status(200).send({ jwt: acc, user });
};

export const logout = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  rep.clearCookie("ref");
  rep.clearCookie("acc");
  rep.clearCookie("uuid");
  return rep.status(200).send({ message: "Logout" });
};

export const getUser = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const uuid = req.cookies.uuid;
  if (!uuid) {
    return rep.status(401).send(ErrorConstraints.UNAUTHORIZED_ERROR);
  }
  const userData = await userManager.getUser(uuid);
  if (userData.error) {
    return rep.status(401).send(ErrorConstraints.INVALID_USER_ID);
  }
  return rep.status(200).send(userData);
};
