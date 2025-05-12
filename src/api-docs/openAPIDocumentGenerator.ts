import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { userRegistry } from "@/api/user/userRouter";
import { authRegistry } from "@/api/auth/authRouter";
import { meRegistry } from "@/api/me/meRouter";
import { trackRegistry } from "@/api/track/trackRouter";
import { commentRegistry } from "@/api/comment/commentRouter";
import { likeRegistry } from "@/api/like/likeRouter";
import { subscriptionRegistry } from "@/api/subscription/subscriptionRouter";
export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    userRegistry,
    authRegistry,
    meRegistry,
    trackRegistry,
    commentRegistry,
    likeRegistry,
    subscriptionRegistry,
  ]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
  });
}
