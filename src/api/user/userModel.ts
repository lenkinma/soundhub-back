import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const RoleEnum = z.enum(["USER", "ADMIN"]);
export type Role = z.infer<typeof RoleEnum>;

// Полная схема User, соответствующая Prisma модели
export const UserSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string().email(),
	password: z.string(),
	role: RoleEnum.default("USER"),
	avatar: z.string().nullable(),
	bio: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// схема ответа юзера без пароля
export const UserResponseSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string(),
	role: RoleEnum, 
	avatar: z.string().nullable(),
	bio: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Схема для обновления пользователя
export const UpdateUserSchema = z.object({
	name: z.string().nullable().optional(),
	avatar: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
	role: RoleEnum.optional(), 
});

// Input Validation для GET users/:id endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Тип User на основе схемы
export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
