import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { Router } from "express";
import { MeResponseSchema } from "./meModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";
import { meController } from "./meController";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { upload } from "@/common/middleware/upload";

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

// Эндпоинт для загрузки аватарки
meRegistry.registerPath({
  method: "post",
  path: "/me/avatar",
  tags: ["Me"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({ avatar: z.any() }),
        },
      },
    },
  },
  responses: createApiResponse(MeResponseSchema, "Avatar uploaded"),
});
meRouter.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  meController.uploadAvatar
);

// Эндпоинт для загрузки трека с обложкой
meRegistry.registerPath({
  method: "post",
  path: "/me/track",
  tags: ["Me"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            track: z.any(),
            cover: z.any().optional(),
            title: z.string(),
            description: z.string().optional(),
            tags: z.union([z.string(), z.array(z.string())]).optional(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({ url: z.string(), cover: z.string().optional(), track: z.any() }),
    "Track uploaded"
  ),
});
meRouter.post(
  "/track",
  authMiddleware,
  upload.fields([
    { name: "track", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  meController.uploadTrack
);

// Эндпоинт для получения треков текущего пользователя
meRegistry.registerPath({
  method: "get",
  path: "/me/tracks",
  tags: ["Me"],
  responses: createApiResponse(z.array(z.any()), "User tracks found"),
});
meRouter.get("/tracks", authMiddleware, meController.getMyTracks);

// Эндпоинт для удаления трека текущего пользователя
meRegistry.registerPath({
  method: "delete",
  path: "/me/track",
  tags: ["Me"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ trackId: z.number() }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({ message: z.string() }),
    "Track deleted"
  ),
});
meRouter.delete(
  "/track",
  authMiddleware,
  // express.json(),
  meController.deleteMyTrack
);

// Эндпоинт для редактирования трека текущего пользователя
meRegistry.registerPath({
  method: "patch",
  path: "/me/track",
  tags: ["Me"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            trackId: z.number(),
            track: z.any().optional(),
            cover: z.any().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            tags: z.union([z.string(), z.array(z.string())]).optional(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.any(), "Track updated"),
});
meRouter.patch(
  "/track",
  authMiddleware,
  upload.fields([
    { name: "track", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  meController.updateMyTrack
);
