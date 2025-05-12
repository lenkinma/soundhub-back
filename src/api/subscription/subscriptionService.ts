import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

class SubscriptionService {
  async subscribe(subscriberId: number, subscribedToId: number) {
    if (subscriberId === subscribedToId) {
      return ServiceResponse.failure(
        "Нельзя подписаться на самого себя.",
        null,
        StatusCodes.BAD_REQUEST
      );
    }
    try {
      const existing = await prisma.subscription.findFirst({
        where: {
          subscriberId,
          subscribedToId,
        },
      });
      if (existing) {
        return ServiceResponse.success("Уже подписан", null);
      }
      await prisma.subscription.create({
        data: { subscriberId, subscribedToId },
      });
      return ServiceResponse.success("Подписка оформлена", null);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Ошибка при подписке.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async unsubscribe(subscriberId: number, subscribedToId: number) {
    try {
      await prisma.subscription.deleteMany({
        where: { subscriberId, subscribedToId },
      });
      return ServiceResponse.success("Подписка удалена", null);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Ошибка при отписке.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSubscribers(userId: number, limit: number = 15, offset: number = 0) {
    try {
      const subscribers = await prisma.subscription.findMany({
        where: { subscribedToId: userId },
        include: {
          subscriber: {
            select: {
              id: true,
              name: true,
              avatar: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        take: limit,
        skip: offset,
      });
      const subscribersWithStats = await Promise.all(
        subscribers.map(async (s) => {
          const likesCount = await prisma.like.count({
            where: { userId: s.subscriber.id },
          });
          const subscribersCount = await prisma.subscription.count({
            where: { subscribedToId: s.subscriber.id },
          });
          return {
            ...s.subscriber,
            likesCount,
            subscribersCount,
          };
        })
      );
      return ServiceResponse.success(
        "Список подписчиков получен",
        subscribersWithStats
      );
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Ошибка при получении подписчиков.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSubscriptions(
    userId: number,
    limit: number = 15,
    offset: number = 0
  ) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { subscriberId: userId },
        include: {
          subscribedTo: {
            select: {
              id: true,
              name: true,
              avatar: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        take: limit,
        skip: offset,
      });
      const subscriptionsWithStats = await Promise.all(
        subscriptions.map(async (s) => {
          const likesCount = await prisma.like.count({
            where: { userId: s.subscribedTo.id },
          });
          const subscribersCount = await prisma.subscription.count({
            where: { subscribedToId: s.subscribedTo.id },
          });
          return {
            ...s.subscribedTo,
            likesCount,
            subscribersCount,
          };
        })
      );
      return ServiceResponse.success(
        "Список подписок получен",
        subscriptionsWithStats
      );
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Ошибка при получении подписок.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFeed(
    userId: number,
    limit: number = 15,
    offset: number = 0,
    currentUserId?: number
  ) {
    try {
      // Получаем id всех, на кого подписан пользователь
      const subscriptions = await prisma.subscription.findMany({
        where: { subscriberId: userId },
        select: { subscribedToId: true },
      });
      const artistIds = subscriptions.map((s) => s.subscribedToId);
      if (artistIds.length === 0) {
        return ServiceResponse.success("Лента пуста", []);
      }
      // Получаем треки этих пользователей
      const tracks = await prisma.track.findMany({
        where: { artistId: { in: artistIds } },
        include: {
          artist: { select: { id: true, name: true, avatar: true } },
          comments: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
          _count: { select: { likes: true } },
          likes: currentUserId
            ? {
                where: { userId: Number(currentUserId) },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
      const result = tracks.map((track) => {
        const isLiked = currentUserId
          ? Array.isArray(track.likes) && track.likes.length > 0
          : false;
        const { _count, likes, ...rest } = track;
        return {
          ...rest,
          isLiked,
          likesCount: _count.likes,
        };
      });
      return ServiceResponse.success("Лента треков получена", result);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Ошибка при получении ленты треков.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const subscriptionService = new SubscriptionService();
