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
    // Получаем параметры сортировки и пагинации
    const sortBy = req.query.sortBy === "likes" ? "likes" : "new";
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const title = req.query.title ? String(req.query.title) : undefined;
    const artist = req.query.artist ? String(req.query.artist) : undefined;
    const tag = req.query.tag ? String(req.query.tag) : undefined;
    console.log("userId передан в сервис:", userId);
    const serviceResponse = await trackService.getAllTracks(
      userId,
      sortBy,
      limit,
      offset,
      title,
      artist,
      tag
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async getTracksByUserId(req: Request, res: Response) {
    let userId: number | undefined = undefined;
    if (req.user && typeof req.user === "object" && "id" in req.user) {
      userId = Number((req.user as any).id);
    }
    const artistId = Number(req.params.id);
    const sortBy = req.query.sortBy === "likes" ? "likes" : "new";
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const title = req.query.title ? String(req.query.title) : undefined;
    const artist = req.query.artist ? String(req.query.artist) : undefined;
    const tag = req.query.tag ? String(req.query.tag) : undefined;
    const serviceResponse = await trackService.getAllTracks(
      userId,
      sortBy,
      limit,
      offset,
      title,
      artist,
      tag,
      artistId
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async getLikedTracks(req: Request, res: Response) {
    // id пользователя берём из params
    const userId = Number(req.params.id);
    let currentUserId: number | undefined = undefined;
    if (req.user && typeof req.user === "object" && "id" in req.user) {
      currentUserId = Number((req.user as any).id);
    }
    const sortBy = req.query.sortBy === "likes" ? "likes" : "new";
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const title = req.query.title ? String(req.query.title) : undefined;
    const artist = req.query.artist ? String(req.query.artist) : undefined;
    const tag = req.query.tag ? String(req.query.tag) : undefined;
    const serviceResponse = await trackService.getLikedTracks(
      userId,
      sortBy,
      limit,
      offset,
      title,
      artist,
      tag,
      currentUserId
    );
    return handleServiceResponse(serviceResponse, res);
  }
}

export const trackController = new TrackController();
