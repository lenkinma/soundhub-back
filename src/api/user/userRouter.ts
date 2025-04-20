import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema, UpdateUserSchema } from "@/api/user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import { authMiddleware } from '@/common/middleware/authMiddleware';
import { authorizeUser } from "@/common/middleware/authorizeUser";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

// регистрация схем в registry (для swagger, бесполезная штука как будто)
userRegistry.register("User", UserSchema);

// Маршрут для получения всех пользователей
userRegistry.registerPath({
	method: "get",
	path: "/users",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Success"),
});
userRouter.get("/", userController.getUsers);


// Маршрут для получения пользователя по id
userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});
userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);




// Регистрация маршрута для обновления пользователя
userRegistry.registerPath({
	method: "put",
	path: "/users/{id}",
	tags: ["User"],
	request: { 
		params: GetUserSchema.shape.params,
		body: {
			content: {
				'application/json': {
					schema: UpdateUserSchema
				}
			}
		}
	},
	responses: {
		...createApiResponse(UserSchema, "User updated successfully"),
		...createApiResponse(z.object({ message: z.string() }), "Bad request", StatusCodes.BAD_REQUEST),
		...createApiResponse(z.object({ message: z.string() }), "Not found", StatusCodes.NOT_FOUND)
	},
});
userRouter.put("/:id", 
	// authMiddleware,
	// authorizeUser,
	validateRequest(z.object({ 
		params: GetUserSchema.shape.params,
		body: UpdateUserSchema 
	})), 
	userController.updateUser
);



// Регистрация маршрута для удаления пользователя
userRegistry.registerPath({
	method: "delete",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: {
		...createApiResponse(z.object({ message: z.string() }), "User deleted successfully"),
		...createApiResponse(z.object({ message: z.string() }), "Not found", StatusCodes.NOT_FOUND)
	},
});
userRouter.delete("/:id", validateRequest(GetUserSchema), userController.deleteUser);

// userRouter.get('/profile', authMiddleware, userController.getProfile);
