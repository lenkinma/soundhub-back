import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import { generateToken } from "../../common/utils/jwtUtils";
import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

import type { User, UpdateUserInput, UserResponse } from "@/api/user/userModel";

export class UserService {
  // Получение всех пользователей
  async findAll(
    sortBy?: "likes" | "subscribers",
    name?: string,
    limit: number = 15,
    offset: number = 0
  ): Promise<ServiceResponse<any[] | null>> {
    try {
      // Формируем условия поиска
      const where: any = {};
      if (name) {
        where.name = { contains: name, mode: "insensitive" };
      }
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      if (!users || users.length === 0) {
        return ServiceResponse.success<any[]>("Users found", []);
      }
      // Добавляем количество подписчиков и лайков для каждого пользователя
      let usersWithStats = await Promise.all(
        users.map(async (user) => {
          const subscribersCount = await prisma.subscription.count({
            where: { subscribedToId: user.id },
          });
          const likesCount = await prisma.like.count({
            where: { userId: user.id },
          });
          return {
            ...user,
            subscribersCount,
            likesCount,
          };
        })
      );
      // Сортировка по фильтру
      if (sortBy === "likes") {
        usersWithStats = usersWithStats.sort(
          (a, b) => b.likesCount - a.likesCount
        );
      } else if (sortBy === "subscribers") {
        usersWithStats = usersWithStats.sort(
          (a, b) => b.subscribersCount - a.subscribersCount
        );
      }
      return ServiceResponse.success<any[]>("Users found", usersWithStats);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Получение пользователя по ID
  async findById(
    id: number,
    currentUserId?: number
  ): Promise<ServiceResponse<UserResponse | null>> {
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
          password: false, // Исключаем пароль из выборки
        },
      });

      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      // Считаем количество лайков на всех треках пользователя
      const likesCount = await prisma.like.count({
        where: { track: { artistId: id } },
      });
      // Считаем количество подписчиков
      const subscribersCount = await prisma.subscription.count({
        where: { subscribedToId: id },
      });
      // Считаем количество подписок
      const subscriptionsCount = await prisma.subscription.count({
        where: { subscriberId: id },
      });
      // Считаем количество треков пользователя
      const tracksCount = await prisma.track.count({
        where: { artistId: id },
      });
      // Проверяем, подписан ли currentUserId на этого пользователя
      console.log("currentUserId:", currentUserId, "profileId:", id);
      let isSubscribed = false;
      if (currentUserId && currentUserId !== id) {
        const sub = await prisma.subscription.findFirst({
          where: {
            subscriberId: Number(currentUserId),
            subscribedToId: Number(id),
          },
        });
        isSubscribed = !!sub;
      }
      console.log("isSubscribed:", isSubscribed);
      return ServiceResponse.success("User found", {
        ...user,
        likesCount,
        subscribersCount,
        subscriptionsCount,
        tracksCount,
        isSubscribed,
      });
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Обновление пользователя
  async updateUser(
    id: number,
    userData: UpdateUserInput
  ): Promise<ServiceResponse<User | null>> {
    try {
      // Проверка существования пользователя
      const existingUser = await prisma.user.findUnique({
        where: { id },
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
          password: false, // Исключаем пароль из результата
        },
      });

      return ServiceResponse.success<User>(
        "User updated successfully",
        updatedUser as User
      );
    } catch (ex) {
      const errorMessage = `Error updating user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Удаление пользователя
  async deleteUser(id: number): Promise<ServiceResponse<null>> {
    try {
      // Проверка существования пользователя
      const existingUser = await prisma.user.findUnique({
        where: { id },
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
        where: { id },
      });

      return ServiceResponse.success<null>("Пользователь успешно удален", null);
    } catch (ex) {
      const errorMessage = `Ошибка при удалении пользователя с id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "Произошла ошибка при удалении пользователя.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Получение всех треков пользователя по id
  // async getUserTracks(id: number) {
  //   try {
  //     const tracks = await prisma.track.findMany({
  //       where: { artistId: id },
  //       include: {
  //         comments: {
  //           include: {
  //             user: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 avatar: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: { createdAt: "desc" },
  //     });
  //     return ServiceResponse.success("User tracks found", tracks);
  //   } catch (ex) {
  //     const errorMessage = `Error finding tracks for user with id ${id}: ${
  //       (ex as Error).message
  //     }`;
  //     logger.error(errorMessage);
  //     return ServiceResponse.failure(
  //       "An error occurred while finding user tracks.",
  //       null,
  //       StatusCodes.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }
}

export const userService = new UserService();
