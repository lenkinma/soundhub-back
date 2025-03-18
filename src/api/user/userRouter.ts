import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema, CreateUserSchema, UpdateUserSchema } from "@/api/user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);
userRegistry.register("CreateUser", CreateUserSchema);

userRegistry.registerPath({
	method: "get",
	path: "/users",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", userController.getUsers);

userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);

// Регистрация маршрута для создания пользователя
userRegistry.registerPath({
	method: "post",
	path: "/users",
	tags: ["User"],
	request: { 
		body: {
			content: {
				'application/json': {
					schema: CreateUserSchema
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
userRouter.post("/", validateRequest(z.object({ body: CreateUserSchema })), userController.createUser);

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

// Маршрут для обновления пользователя
userRouter.put("/:id", 
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

// Маршрут для удаления пользователя
userRouter.delete("/:id", validateRequest(GetUserSchema), userController.deleteUser);
