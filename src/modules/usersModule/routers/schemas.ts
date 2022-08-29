import { FastifySchema } from "fastify";

export const signUpSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["email", "login", "password"],
    properties: {
      email: {
        type: "string",
        minLength: 5
      },
      login: {
        type: "string",
        minLength: 4
      },
      password: {
        type: "string"
      }
    }
  }
};

export const signInSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["login", "password"],
    properties: {
      login: {
        type: "string",
        minLength: 4
      },
      password: {
        type: "string"
      }
    }
  }
};

