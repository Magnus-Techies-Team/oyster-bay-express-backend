import { FastifyReply, FastifyRequest } from "fastify";
import {
  RouteGenericInterfaceCreateUser,
  RouteGenericInterfaceLogin,
} from "~/modules/usersModule/types/reqInterface";
import { userManager } from "~/projectDependencies";
import { sign } from "jsonwebtoken";

export const createUser = async (
  req: FastifyRequest<RouteGenericInterfaceCreateUser>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const user = await userManager.createUser(req.body);
  if (user.error) {
    return rep.status(400).send({ error: user.error });
  }
  return rep.status(200).send(user);
};

export const login = async (
  req: FastifyRequest<RouteGenericInterfaceLogin>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const user = await userManager.login(req.body);
  if (user.error) {
    return rep.status(400).send({ error: user.error });
  }
  const jwt = sign(user, <string>process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: 21600,
  });
  const acc = sign(user, <string>process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 300,
  });
  rep.setCookie("ref", jwt, { httpOnly: true });
  return rep.status(200).send({ jwt: acc, user });
};

export const logout = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  rep.clearCookie("ref");
  rep.clearCookie("acc");
  return rep.status(200).send({ message: "Logout" });
};
