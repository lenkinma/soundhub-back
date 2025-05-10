import type { Request, Response } from "express";
import { likeService } from "./likeService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class LikeController {
  async likeTrack(req: Request, res: Response) {
    const userId =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const trackId = Number(req.params.trackId);
    const serviceResponse = await likeService.likeTrack(userId, trackId);
    return handleServiceResponse(serviceResponse, res);
  }
  async unlikeTrack(req: Request, res: Response) {
    const userId =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const trackId = Number(req.params.trackId);
    const serviceResponse = await likeService.unlikeTrack(userId, trackId);
    return handleServiceResponse(serviceResponse, res);
  }
}
export const likeController = new LikeController();
