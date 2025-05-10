import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

class TrackService {
  async getAllTracks(userId?: number) {
    try {
      const tracks = await prisma.track.findMany({
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: { likes: true },
          },
          likes: userId
            ? {
                where: { userId: Number(userId) },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
      });
      // Корректно вычисляем isLiked до деструктуризации, добавляем логирование
      const result = tracks.map((track) => {
        console.log(
          "track.id:",
          track.id,
          "likes:",
          track.likes,
          "userId:",
          userId
        );
        const isLiked = userId
          ? Array.isArray(track.likes) && track.likes.length > 0
          : false;
        const { _count, likes, ...rest } = track;
        return {
          ...rest,
          isLiked,
          likesCount: _count.likes,
        };
      });
      return ServiceResponse.success("All tracks found", result);
    } catch (ex) {
      const errorMessage = `Error finding all tracks: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding all tracks.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const trackService = new TrackService();
