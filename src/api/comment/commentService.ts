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
  async deleteComment(commentId: number, userId: number) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        return ServiceResponse.failure(
          "Комментарий не найден",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      if (comment.userId !== userId) {
        return ServiceResponse.failure(
          "Нет прав на удаление этого комментария",
          null,
          StatusCodes.FORBIDDEN
        );
      }
      await prisma.comment.delete({ where: { id: commentId } });
      return ServiceResponse.success("Комментарий удалён", null);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Ошибка при удалении комментария",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async updateComment(commentId: number, userId: number, text: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        return ServiceResponse.failure(
          "Комментарий не найден",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      if (comment.userId !== userId) {
        return ServiceResponse.failure(
          "Нет прав на редактирование этого комментария",
          null,
          StatusCodes.FORBIDDEN
        );
      }
      const updated = await prisma.comment.update({
        where: { id: commentId },
        data: { text },
      });
      return ServiceResponse.success("Комментарий обновлён", updated);
    } catch (ex) {
      logger.error(ex);
      return ServiceResponse.failure(
        "Ошибка при обновлении комментария",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export const commentService = new CommentService();
