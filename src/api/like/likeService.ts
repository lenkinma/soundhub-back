import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

class LikeService {
  async likeTrack(userId: number, trackId: number) {
    try {
      const existing = await prisma.like.findUnique({
        where: { userId_trackId: { userId, trackId } },
      });
      if (existing) return ServiceResponse.success("Already liked", null);
      await prisma.like.create({ data: { userId, trackId } });
      return ServiceResponse.success("Track liked", null);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Error liking track",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async unlikeTrack(userId: number, trackId: number) {
    try {
      await prisma.like.deleteMany({ where: { userId, trackId } });
      return ServiceResponse.success("Track unliked", null);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Error unliking track",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export const likeService = new LikeService();
