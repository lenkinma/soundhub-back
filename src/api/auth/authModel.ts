import { z } from "zod";

// схема логина юзера
export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});


// Схема для создания пользователя (без id и дат)
export const RegisterNewUserSchema = z.object({
	name: z.string().nullable().optional(),
	email: z.string().email(),
	password: z.string().min(6),
	avatar: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterNewUserInput = z.infer<typeof RegisterNewUserSchema>;