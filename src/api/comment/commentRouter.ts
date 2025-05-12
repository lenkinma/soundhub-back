import { Router } from "express";
import { commentController } from "./commentController";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";

export const commentRegistry = new OpenAPIRegistry();
export const commentRouter: Router = Router();

commentRegistry.registerPath({
  method: "post",
  path: "/tracks/{trackId}/comments",
  tags: ["Comment"],
  request: {
    params: z.object({ trackId: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ text: z.string() }),
        },
      },
    },
  },
  responses: createApiResponse(z.any(), "Comment added"),
});

commentRouter.post(
  "/tracks/:trackId/comments",
  authMiddleware,
  commentController.addComment
);

commentRegistry.registerPath({
  method: "get",
  path: "/tracks/{trackId}/comments",
  tags: ["Comment"],
  request: {
    params: z.object({ trackId: z.string() }),
  },
  responses: createApiResponse(z.array(z.any()), "Comments found"),
});

commentRouter.get("/tracks/:trackId/comments", commentController.getComments);

commentRouter.delete(
  "/comments/:commentId",
  authMiddleware,
  commentController.deleteComment
);

commentRouter.patch(
  "/comments/:commentId",
  authMiddleware,
  commentController.updateComment
);

commentRegistry.registerPath({
  method: "delete",
  path: "/comments/{commentId}",
  tags: ["Comment"],
  request: {
    params: z.object({ commentId: z.string() }),
  },
  responses: createApiResponse(z.any(), "Комментарий удалён"),
});

commentRegistry.registerPath({
  method: "patch",
  path: "/comments/{commentId}",
  tags: ["Comment"],
  request: {
    params: z.object({ commentId: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ text: z.string() }),
        },
      },
    },
  },
  responses: createApiResponse(z.any(), "Комментарий обновлён"),
});
