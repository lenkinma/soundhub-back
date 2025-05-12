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
  request: {
    query: z.object({
      sortBy: z
        .enum(["likes", "new"])
        .optional()
        .describe(
          "Сортировка: 'likes' — по лайкам, 'new' — по новизне (по умолчанию)"
        ),
      limit: z
        .string()
        .optional()
        .describe("Сколько треков на странице (по умолчанию 15)"),
      offset: z
        .string()
        .optional()
        .describe("Смещение для пагинации (по умолчанию 0)"),
      title: z.string().optional().describe("Поиск по названию трека"),
      artist: z.string().optional().describe("Поиск по имени артиста"),
      tag: z.string().optional().describe("Поиск по тегу"),
    }),
  },
  responses: createApiResponse(z.array(z.any()), "All tracks found"),
});
trackRouter.get("/", optionalAuthMiddleware, trackController.getAllTracks);

// Эндпоинт для получения треков конкретного пользователя
trackRegistry.registerPath({
  method: "get",
  path: "/tracks/{id}",
  tags: ["Track"],
  request: {
    params: z.object({ id: z.string().describe("ID пользователя (артиста)") }),
    query: z.object({
      sortBy: z
        .enum(["likes", "new"])
        .optional()
        .describe(
          "Сортировка: 'likes' — по лайкам, 'new' — по новизне (по умолчанию)"
        ),
      limit: z
        .string()
        .optional()
        .describe("Сколько треков на странице (по умолчанию 15)"),
      offset: z
        .string()
        .optional()
        .describe("Смещение для пагинации (по умолчанию 0)"),
      title: z.string().optional().describe("Поиск по названию трека"),
      artist: z.string().optional().describe("Поиск по имени артиста"),
      tag: z.string().optional().describe("Поиск по тегу"),
    }),
  },
  responses: createApiResponse(z.array(z.any()), "User tracks found"),
});
trackRouter.get(
  "/:id",
  optionalAuthMiddleware,
  trackController.getTracksByUserId
);

// Эндпоинт для получения треков, которые лайкнул пользователь
trackRegistry.registerPath({
  method: "get",
  path: "/tracks/liked/{id}",
  tags: ["Track"],
  request: {
    params: z.object({ id: z.string().describe("ID пользователя (артиста)") }),
    query: z.object({
      sortBy: z
        .enum(["likes", "new"])
        .optional()
        .describe(
          "Сортировка: 'likes' — по лайкам, 'new' — по новизне (по умолчанию)"
        ),
      limit: z
        .string()
        .optional()
        .describe("Сколько треков на странице (по умолчанию 15)"),
      offset: z
        .string()
        .optional()
        .describe("Смещение для пагинации (по умолчанию 0)"),
      title: z.string().optional().describe("Поиск по названию трека"),
      artist: z.string().optional().describe("Поиск по имени артиста"),
      tag: z.string().optional().describe("Поиск по тегу"),
    }),
  },
  responses: createApiResponse(z.array(z.any()), "Liked tracks found"),
});
trackRouter.get(
  "/liked/:id",
  optionalAuthMiddleware,
  trackController.getLikedTracks
);
