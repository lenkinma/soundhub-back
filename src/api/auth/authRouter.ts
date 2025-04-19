import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authController } from "./authController";
import { LoginSchema, RegisterNewUserSchema } from "./authModel";
import { UserSchema } from "../user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "../user/userController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();


// регистрация схем в registry (для swagger, бесполезная штука как будто)
authRegistry.register("Login", LoginSchema);
authRegistry.register("RegisterNewUser", RegisterNewUserSchema);

// маршрут для логина
authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
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
  }), "Login successful", StatusCodes.CREATED),
});

authRouter.post('/login',  authController.login);



// Регистрация маршрута для создания пользователя
authRegistry.registerPath({
	method: "post",
	path: "/auth/register",
	tags: ["Auth"],
	request: { 
		body: {
			content: {
				'application/json': {
					schema: RegisterNewUserSchema
				}
			}
		}
	},
	responses: {
		...createApiResponse(UserSchema, "User created successfully", StatusCodes.CREATED),
		...createApiResponse(z.object({ message: z.string() }), "Bad request", StatusCodes.BAD_REQUEST)
	},
});

// Маршрут для создания пользователя
authRouter.post("/register", 
  validateRequest(z.object({ body: RegisterNewUserSchema })), 
  authController.registerNewUser);

