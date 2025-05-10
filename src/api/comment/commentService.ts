import prisma from "@/db/prisma";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

class CommentService {
  async addComment(userId: number, trackId: number, text: string) {
    try {
      const comment = await prisma.comment.create({
        data: { userId, trackId, text },
      });
      return ServiceResponse.success("Comment added", comment);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Error adding comment",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getComments(trackId: number) {
    // console.log("getComments");
    try {
      const comments = await prisma.comment.findMany({
        where: { trackId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
      });
      return ServiceResponse.success("Comments found", comments);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Error getting comments",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export const commentService = new CommentService();
