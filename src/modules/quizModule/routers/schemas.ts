import { FastifySchema } from "fastify";

export const createQuizSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["title", "private", "tags", "questions"],
    properties: {
      title: { type: "string" },
      tags: {
        type: "array",
        minItems: 1,
        items: {
          type: "string"
        }
      },
      private: { type: "boolean" },
      questions: {
        type: "array",
        items: {
          type: "object",
          required: ["question", "round", "answer", "cost", "topic"],
          properties: {
            question: {
              type: "string"
            },
            round: { type: "number", minimum: 1 },
            answer: { type: "string" },
            cost: { type: "number", minimum: 0 },
            topic: { type: "string" }
          }
        }
      }
    }
  }
};

export const getQuizSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    }
  }
};