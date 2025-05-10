import type { Request, Response } from "express";
import { trackService } from "./trackService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class TrackController {
  async getAllTracks(req: Request, res: Response) {
    // Логируем req.user для отладки
    console.log("req.user:", req.user);
    let userId: number | undefined = undefined;
    if (req.user && typeof req.user === "object" && "id" in req.user) {
      userId = Number((req.user as any).id);
    }
    console.log("userId передан в сервис:", userId);
    const serviceResponse = await trackService.getAllTracks(userId);
    return handleServiceResponse(serviceResponse, res);
  }
}

export const trackController = new TrackController();
