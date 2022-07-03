import { FastifyReply, FastifyRequest } from "fastify";
import { RouteGenericInterfaceCreateQuiz } from "../types/reqInterface";
import { quizManager } from "../../../projectDependencies";

export const createQuiz = async (
  req: FastifyRequest<RouteGenericInterfaceCreateQuiz>,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const userId = req.cookies.uuid;
  const quiz = { ...req.body };
  const result = await quizManager.recordQuiz(quiz, userId);
  return rep.status(200).send(result);
};

export const getQuiz = async (
  req: FastifyRequest,
  rep: FastifyReply
): Promise<FastifyReply> => {
  const uuid = req.cookies.uuid;
  const quiz = await quizManager.getAllAvailableQuizes(uuid);
  if (quiz.error) {
    return rep.status(400).send(quiz);
  }
  return rep.status(200).send(quiz);
};
