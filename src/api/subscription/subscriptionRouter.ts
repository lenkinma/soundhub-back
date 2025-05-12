import { Router } from "express";
import { subscriptionController } from "./subscriptionController";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";
import { optionalAuthMiddleware } from "@/common/middleware/optionalAuthMiddleware";

export const subscriptionRegistry = new OpenAPIRegistry();
export const subscriptionRouter: Router = Router();

// Подписаться на пользователя
subscriptionRegistry.registerPath({
  method: "post",
  path: "/subscriptions/{id}",
  tags: ["Subscription"],
  request: { params: z.object({ id: z.string().describe("ID пользователя") }) },
  responses: createApiResponse(z.any(), "Подписка оформлена"),
});
subscriptionRouter.post(
  "/:id",
  authMiddleware,
  subscriptionController.subscribe
);

// Отписаться от пользователя
subscriptionRegistry.registerPath({
  method: "delete",
  path: "/subscriptions/{id}",
  tags: ["Subscription"],
  request: { params: z.object({ id: z.string().describe("ID пользователя") }) },
  responses: createApiResponse(z.any(), "Подписка удалена"),
});
subscriptionRouter.delete(
  "/:id",
  authMiddleware,
  subscriptionController.unsubscribe
);

// Получить подписчиков пользователя
subscriptionRegistry.registerPath({
  method: "get",
  path: "/subscriptions/{id}/subscribers",
  tags: ["Subscription"],
  request: {
    params: z.object({ id: z.string().describe("ID пользователя") }),
    query: z.object({
      limit: z
        .string()
        .optional()
        .describe("Сколько пользователей на странице (по умолчанию 15)"),
      offset: z
        .string()
        .optional()
        .describe("Смещение для пагинации (по умолчанию 0)"),
    }),
  },
  responses: createApiResponse(z.array(z.any()), "Список подписчиков получен"),
});
subscriptionRouter.get(
  "/:id/subscribers",
  subscriptionController.getSubscribers
);

// Получить подписки пользователя
subscriptionRegistry.registerPath({
  method: "get",
  path: "/subscriptions/{id}/subscriptions",
  tags: ["Subscription"],
  request: {
    params: z.object({ id: z.string().describe("ID пользователя") }),
    query: z.object({
      limit: z
        .string()
        .optional()
        .describe("Сколько пользователей на странице (по умолчанию 15)"),
      offset: z
        .string()
        .optional()
        .describe("Смещение для пагинации (по умолчанию 0)"),
    }),
  },
  responses: createApiResponse(z.array(z.any()), "Список подписок получен"),
});
subscriptionRouter.get(
  "/:id/subscriptions",
  optionalAuthMiddleware,
  subscriptionController.getSubscriptions
);

// Получить ленту треков из подписок пользователя
subscriptionRegistry.registerPath({
  method: "get",
  path: "/subscriptions/{id}/feed",
  tags: ["Subscription"],
  request: {
    params: z.object({ id: z.string().describe("ID пользователя") }),
    query: z.object({
      limit: z
        .string()
        .optional()
        .describe("Сколько треков на странице (по умолчанию 15)"),
      offset: z
        .string()
        .optional()
        .describe("Смещение для пагинации (по умолчанию 0)"),
    }),
  },
  responses: createApiResponse(z.array(z.any()), "Лента треков получена"),
});
subscriptionRouter.get(
  "/:id/feed",
  optionalAuthMiddleware,
  subscriptionController.getFeed
);
