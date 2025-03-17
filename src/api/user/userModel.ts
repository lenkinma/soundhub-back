import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Обновленная схема User, соответствующая Prisma модели
export const UserSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string().email(),
	password: z.string(),
	avatar: z.string().nullable(),
	bio: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Схема для создания пользователя (без id и дат)
export const CreateUserSchema = z.object({
	name: z.string().nullable().optional(),
	email: z.string().email(),
	password: z.string().min(6),
	avatar: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
});

// Схема для обновления пользователя
export const UpdateUserSchema = z.object({
	name: z.string().nullable().optional(),
	avatar: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
});

// Input Validation для GET users/:id endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Тип User на основе схемы
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
