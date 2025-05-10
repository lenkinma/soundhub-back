import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { trackController } from "./trackController";
import { optionalAuthMiddleware } from "@/common/middleware/optionalAuthMiddleware";

export const trackRegistry = new OpenAPIRegistry();
export const trackRouter: Router = express.Router();

// Эндпоинт для получения всех треков всех пользователей
trackRegistry.registerPath({
  method: "get",
  path: "/tracks",
  tags: ["Track"],
  responses: createApiResponse(z.array(z.any()), "All tracks found"),
});
trackRouter.get("/", optionalAuthMiddleware, trackController.getAllTracks);
