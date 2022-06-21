import { FastifyReply, FastifyRequest } from "fastify";
import { RouteGenericInterfaceCreateQuiz } from "../types/reqInterface";
import QuizManager from "../utils/QuizManager";

export const createQuiz = async (
  req: FastifyRequest<RouteGenericInterfaceCreateQuiz>,
  rep: FastifyReply
) => {
  const userId = rep.getHeader("uuid");
  const quiz = { ...req.body, author: userId };
  const result = await QuizManager.recordQuiz(quiz, userId!);
  return rep.status(200).send(result);
};