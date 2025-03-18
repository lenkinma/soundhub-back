import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authController } from "./authController";
import { LoginSchema, RegisterSchema } from "./authModel";

export const authRegistry = new OpenAPIRegistry();
const authRouter: Router = express.Router();

// Регистрация маршрута для регистрации
authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterSchema,
        },
      },
    },
  },
  responses: createApiResponse(z.object({ 
    user: z.object({ 
      id: z.number(), 
      email: z.string() 
    }), 
    token: z.string() 
  }), "Registration successful", StatusCodes.CREATED),
});

authRouter.post('/login', authController.login);

export { authRouter }; 