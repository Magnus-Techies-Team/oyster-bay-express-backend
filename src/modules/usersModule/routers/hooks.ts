import { createHash } from  "node:crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteGenericInterfaceCreateUser, RouteGenericInterfaceLogin } from "../types/reqInterface";

export const hashPassword = (
  req: FastifyRequest<RouteGenericInterfaceCreateUser | RouteGenericInterfaceLogin>,
  rep: FastifyReply,
  done: () => void
): void => {
  const hash = createHash("sha256");
  const encrypted = hash.update(req.body.password).digest("base64");
  req.body = { ...req.body, password: encrypted };
  done();
};
