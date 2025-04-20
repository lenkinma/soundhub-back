import { StatusCodes } from "http-status-codes";
import bcrypt from 'bcrypt';
import { generateToken } from '../../common/utils/jwtUtils';
import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

import type { User, UpdateUserInput, UserResponse } from "@/api/user/userModel";


export class UserService {
	// Получение всех пользователей
	async findAll(): Promise<ServiceResponse<User[] | null>> {
		try {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					avatar: true,
					role: true,
					bio: true,
					createdAt: true,
					updatedAt: true,
					password: false // Исключаем пароль из выборки
				}
			});
			
			if (!users || users.length === 0) {
				return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User[]>("Users found", users as User[]);
		} catch (ex) {
			const errorMessage = `Error finding all users: $${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while retrieving users.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Получение пользователя по ID
	async findById(id: number): Promise<ServiceResponse<User | null>> {
		try {
			const user = await prisma.user.findUnique({
				where: { id },
				select: {
					id: true,
					name: true,
					email: true,
					avatar: true,
					role: true,
					bio: true,
					createdAt: true,
					updatedAt: true,
					password: false // Исключаем пароль из выборки
				}
			});

			
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user as User);
		} catch (ex) {
			const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
	
	
	
	// Обновление пользователя
	async updateUser(id: number, userData: UpdateUserInput): Promise<ServiceResponse<User | null>> {
		try {
			// Проверка существования пользователя
			const existingUser = await prisma.user.findUnique({
				where: { id }
			});
			
			if (!existingUser) {
				return ServiceResponse.failure(
					"User not found", 
					null, 
					StatusCodes.NOT_FOUND
				);
			}

			// if (user.id !== id) {
			// 	return ServiceResponse.failure(
			// 		"You are not allowed to update this user", 
			// 		null, 
			// 		StatusCodes.FORBIDDEN
			// 	);
			// }
			
			// Обновление пользователя
			const updatedUser = await prisma.user.update({
				where: { id },
				data: userData,
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
			
			return ServiceResponse.success<User>(
				"User updated successfully", 
				updatedUser as User
			);
		} catch (ex) {
			const errorMessage = `Error updating user with id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"An error occurred while updating user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Удаление пользователя
	async deleteUser(id: number): Promise<ServiceResponse<null>> {
		try {
			// Проверка существования пользователя
			const existingUser = await prisma.user.findUnique({
				where: { id }
			});
			
			if (!existingUser) {
				return ServiceResponse.failure(
					"Пользователь не найден", 
					null, 
					StatusCodes.NOT_FOUND
				);
			}
			
			// Удаление пользователя из бд
			await prisma.user.delete({
				where: { id }
			});
			
			return ServiceResponse.success<null>(
				"Пользователь успешно удален", 
				null
			);
		} catch (ex) {
			const errorMessage = `Ошибка при удалении пользователя с id ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"Произошла ошибка при удалении пользователя.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	









}

export const userService = new UserService();
