import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

class TrackService {
  async getAllTracks(
    userId?: number,
    sortBy: "likes" | "new" = "new",
    limit: number = 15,
    offset: number = 0,
    title?: string,
    artist?: string,
    tag?: string,
    artistId?: number
  ) {
    try {
      // Формируем условия поиска
      const where: any = {};
      if (title) {
        where.title = { contains: title, mode: "insensitive" };
      }
      if (artist) {
        where.artist = {
          name: { contains: artist, mode: "insensitive" },
        };
      }
      if (tag) {
        where.tags = { has: tag };
      }
      if (artistId) {
        where.artistId = artistId;
      }
      let tracks;
      if (sortBy === "likes") {
        // Получаем все треки с количеством лайков
        tracks = await prisma.track.findMany({
          where,
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
        });
        // Сортируем по количеству лайков и пагинируем в JS
        tracks = tracks
          .sort(
            (a, b) =>
              b._count.likes - a._count.likes ||
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(offset, offset + limit);
      } else {
        // Сортировка и пагинация по новизне на уровне БД
        tracks = await prisma.track.findMany({
          where,
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
          take: limit,
          skip: offset,
        });
      }
      const result = tracks.map((track) => {
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
      logger.error(ex);
      const errorMessage = `Error finding all tracks: ${(ex as Error).message}`;
      return ServiceResponse.failure(
        "An error occurred while finding all tracks.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTracksByUserId(artistId: number, currentUserId?: number) {
    try {
      const tracks = await prisma.track.findMany({
        where: { artistId },
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
          likes: currentUserId
            ? {
                where: { userId: Number(currentUserId) },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
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
      return ServiceResponse.success("User tracks found", result);
    } catch (ex) {
      const errorMessage = `Error finding tracks for user with id ${artistId}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding user tracks.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getLikedTracks(
    userId: number,
    sortBy: "likes" | "new" = "new",
    limit: number = 15,
    offset: number = 0,
    title?: string,
    artist?: string,
    tag?: string,
    currentUserId?: number
  ) {
    try {
      // Получаем id треков, которые лайкнул пользователь
      const likes = await prisma.like.findMany({
        where: { userId },
        select: { trackId: true },
      });
      const likedTrackIds = likes.map((like) => like.trackId);
      if (likedTrackIds.length === 0) {
        return ServiceResponse.success("Liked tracks found", []);
      }
      // Формируем условия поиска
      const where: any = { id: { in: likedTrackIds } };
      if (title) {
        where.title = { contains: title, mode: "insensitive" };
      }
      if (artist) {
        where.artist = {
          name: { contains: artist, mode: "insensitive" },
        };
      }
      if (tag) {
        where.tags = { has: tag };
      }
      let tracks;
      if (sortBy === "likes") {
        tracks = await prisma.track.findMany({
          where,
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
            likes: currentUserId
              ? {
                  where: { userId: Number(currentUserId) },
                  select: { id: true },
                }
              : false,
          },
        });
        tracks = tracks
          .sort(
            (a, b) =>
              b._count.likes - a._count.likes ||
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(offset, offset + limit);
      } else {
        tracks = await prisma.track.findMany({
          where,
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
      }
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
      return ServiceResponse.success("Liked tracks found", result);
    } catch (ex) {
      logger.error(ex);
      const errorMessage = `Error finding liked tracks: ${
        (ex as Error).message
      }`;
      return ServiceResponse.failure(
        "An error occurred while finding liked tracks.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const trackService = new TrackService();
