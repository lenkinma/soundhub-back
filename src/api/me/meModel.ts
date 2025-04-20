import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";


extendZodWithOpenApi(z);

// Схема для ответа с данными профиля
export const MeResponseSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string().email(),
    avatar: z.string().nullable(),
    bio: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type MeResponse = z.infer<typeof MeResponseSchema>;