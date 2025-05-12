import { ServiceResponse } from "@/common/models/serviceResponse";
import prisma from "@/db/prisma";
import { StatusCodes } from "http-status-codes";
import { MeResponse } from "./meModel";
import { logger } from "@/server";
import { uploadToS3 } from "@/common/services/s3Service";

export class MeService {
  async getMe(id: number): Promise<ServiceResponse<MeResponse | null>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
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
      return ServiceResponse.success("User found", {
        ...user,
        likesCount,
        subscribersCount,
        subscriptionsCount,
        tracksCount,
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

  async updateAvatar(
    id: number,
    avatarUrl: string
  ): Promise<ServiceResponse<MeResponse | null>> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return ServiceResponse.success<MeResponse>(
        "Avatar updated",
        user as MeResponse
      );
    } catch (ex) {
      const errorMessage = `Error updating avatar for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating avatar.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async uploadTrack(
    id: number,
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
    title: string,
    description?: string,
    tags?: string[],
    coverBuffer?: Buffer,
    coverOriginalName?: string,
    coverMimetype?: string
  ) {
    try {
      const ext = originalName.split(".").pop();
      const filename = `${id}_${Date.now()}.${ext}`;
      const { uploadToS3 } = await import("@/common/services/s3Service");
      const url = await uploadToS3(fileBuffer, filename, mimetype, "tracks");
      let coverUrl: string | undefined = undefined;
      if (coverBuffer && coverOriginalName && coverMimetype) {
        const coverExt = coverOriginalName.split(".").pop();
        const coverFilename = `${id}_${Date.now()}_cover.${coverExt}`;
        coverUrl = await uploadToS3(
          coverBuffer,
          coverFilename,
          coverMimetype,
          "covers"
        );
      }
      const track = await prisma.track.create({
        data: {
          title,
          description,
          fileUrl: url,
          cover: coverUrl,
          tags: tags || [],
          artistId: id,
        },
      });
      return ServiceResponse.success("Track uploaded", {
        url,
        cover: coverUrl,
        track,
      });
    } catch (ex) {
      const errorMessage = `Error uploading track for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while uploading track.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteMyTrack(userId: number, trackId: number) {
    try {
      // Проверяем, что трек принадлежит пользователю
      const track = await prisma.track.findUnique({
        where: { id: trackId },
        select: { artistId: true },
      });
      if (!track || track.artistId !== userId) {
        return ServiceResponse.failure(
          "Track not found or access denied.",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      await prisma.track.delete({ where: { id: trackId } });
      return ServiceResponse.success("Track deleted", null);
    } catch (ex) {
      const errorMessage = `Error deleting track with id ${trackId} for user ${userId}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting track.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateMyTrack(
    userId: number,
    trackId: number,
    update: {
      title?: string;
      description?: string;
      tags?: string[];
      fileBuffer?: Buffer;
      fileOriginalName?: string;
      fileMimetype?: string;
      coverBuffer?: Buffer;
      coverOriginalName?: string;
      coverMimetype?: string;
    }
  ) {
    try {
      // Проверяем, что трек принадлежит пользователю
      const track = await prisma.track.findUnique({
        where: { id: trackId },
        select: { artistId: true },
      });
      if (!track || track.artistId !== userId) {
        return ServiceResponse.failure(
          "Track not found or access denied.",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      // const { uploadToS3 } = await import("@/common/services/s3Service");
      let fileUrl: string | undefined = undefined;
      let coverUrl: string | undefined = undefined;
      if (update.fileBuffer && update.fileOriginalName && update.fileMimetype) {
        const ext = update.fileOriginalName.split(".").pop();
        const filename = `${userId}_${Date.now()}.${ext}`;
        fileUrl = await uploadToS3(
          update.fileBuffer,
          filename,
          update.fileMimetype,
          "tracks"
        );
      }
      if (
        update.coverBuffer &&
        update.coverOriginalName &&
        update.coverMimetype
      ) {
        const coverExt = update.coverOriginalName.split(".").pop();
        const coverFilename = `${userId}_${Date.now()}_cover.${coverExt}`;
        coverUrl = await uploadToS3(
          update.coverBuffer,
          coverFilename,
          update.coverMimetype,
          "covers"
        );
      }
      const updatedTrack = await prisma.track.update({
        where: { id: trackId },
        data: {
          title: update.title,
          description: update.description,
          tags: update.tags,
          ...(fileUrl ? { fileUrl } : {}),
          ...(coverUrl ? { cover: coverUrl } : {}),
        },
      });
      return ServiceResponse.success("Track updated", updatedTrack);
    } catch (ex) {
      const errorMessage = `Error updating track with id ${trackId} for user ${userId}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating track.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const meService = new MeService();
