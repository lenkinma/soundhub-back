import { Router } from "express";
import { likeController } from "./likeController";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";

export const likeRegistry = new OpenAPIRegistry();
export const likeRouter: Router = Router();

likeRegistry.registerPath({
  method: "post",
  path: "/tracks/{trackId}/like",
  tags: ["Like"],
  request: {
    params: z.object({ trackId: z.string() }),
  },
  responses: createApiResponse(z.any(), "Track liked"),
});

likeRouter.post(
  "/tracks/:trackId/like",
  authMiddleware,
  likeController.likeTrack
);

likeRegistry.registerPath({
  method: "delete",
  path: "/tracks/{trackId}/like",
  tags: ["Like"],
  request: {
    params: z.object({ trackId: z.string() }),
  },
  responses: createApiResponse(z.any(), "Track unliked"),
});

likeRouter.delete(
  "/tracks/:trackId/like",
  authMiddleware,
  likeController.unlikeTrack
);
