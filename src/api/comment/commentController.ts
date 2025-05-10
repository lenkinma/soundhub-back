import type { Request, Response } from "express";
import { commentService } from "./commentService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class CommentController {
  async addComment(req: Request, res: Response) {
    const userId =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const trackId = Number(req.params.trackId);
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Текст комментария обязателен" });
    }
    const serviceResponse = await commentService.addComment(
      userId,
      trackId,
      text
    );
    return handleServiceResponse(serviceResponse, res);
  }
  async getComments(req: Request, res: Response) {
    // console.log("getComments");
    const trackId = Number(req.params.trackId);
    const serviceResponse = await commentService.getComments(trackId);
    return handleServiceResponse(serviceResponse, res);
  }
}
export const commentController = new CommentController();
