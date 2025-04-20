import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Router } from "express";
import { MeResponseSchema } from "./meModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";
import { meController } from "./meController";
import { authMiddleware } from '@/common/middleware/authMiddleware';

export const meRegistry = new OpenAPIRegistry();
export const meRouter: Router = express.Router();

// регистрация схем в registry (для swagger, бесполезная штука как будто)
meRegistry.register("Me", MeResponseSchema);

// Маршрут для получения всех пользователей
meRegistry.registerPath({
	method: "get",
	path: "/me",
	tags: ["Me"],
	responses: createApiResponse(z.array(MeResponseSchema), "Success"),
});
meRouter.get("/", authMiddleware, meController.getMe);