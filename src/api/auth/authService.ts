
import { StatusCodes } from "http-status-codes";
import bcrypt from 'bcrypt';
import { generateToken } from '../../common/utils/jwtUtils';
import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

import type { RegisterNewUserInput } from "@/api/auth/authModel";
import type { UserResponse } from "@/api/user/userModel";

export class AuthService {

    async login(email: string, password: string) {
		try {
			const user = await prisma.user.findUnique({ where: { email } });
			
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new Error('Invalid email or password');
		}

		const token = generateToken({ id: user.id, email: user.email });
		const responseObject = { token };
			return ServiceResponse.success("Вход осуществлен успешно", responseObject, StatusCodes.OK);


		} catch (ex) {
			const errorMessage = `Error logging in: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

    // Создание пользователя
	async registerNewUser(userData: RegisterNewUserInput): Promise<ServiceResponse<{ user: UserResponse; token: string } | null>> {
		try {
			// Проверка, существует ли пользователь с таким email
			const existingUser = await prisma.user.findUnique({
				where: { email: userData.email }
			});
			
			if (existingUser) {
				return ServiceResponse.failure(
					"User with this email already exists", 
					null, 
					StatusCodes.BAD_REQUEST
				);
			}
			
			// Хеширование пароля
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(userData.password, salt);
			
			// Создание пользователя
			const newUser = await prisma.user.create({
				data: {
					...userData,
					password: hashedPassword
				},
				select: {
					id: true,
					name: true,
					email: true,
					avatar: true,
					role: true,
					bio: true,
					createdAt: true,
					updatedAt: true,
					password: false // Исключаем пароль из результата
				}
			});

			// Генерация токена
			const token = generateToken({ id: newUser.id, email: newUser.email });

			// Возвращаем пользователя и токен
			return ServiceResponse.success(
				"User created successfully", 
				{ user: newUser, token }, 
				StatusCodes.CREATED
			);
		} catch (ex) {
			const errorMessage = `Error creating user: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while creating user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}