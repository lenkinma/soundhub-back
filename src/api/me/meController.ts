import type { Request, RequestHandler, Response } from "express";
import { uploadToS3 } from "@/common/services/s3Service";
import { meService } from "./meService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class MeController {
  async getMe(req: Request, res: Response) {
    console.log("111111111111111");
    const id =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const serviceResponse = await meService.getMe(id);
    return handleServiceResponse(serviceResponse, res);
  }

  async uploadAvatar(req: Request, res: Response) {
    const id =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    if (!req.file) {
      return res.status(400).json({ message: "Файл не загружен" });
    }
    const ext = req.file.originalname.split(".").pop();
    const filename = `${id}_${Date.now()}.${ext}`;
    try {
      // console.log(req.file.originalname);
      const url = await uploadToS3(
        req.file.buffer,
        filename,
        req.file.mimetype,
        "avatars"
      );

      const serviceResponse = await meService.updateAvatar(id, url);
      // Возвращаем только url, либо всю сущность пользователя, если нужно
      return handleServiceResponse(serviceResponse, res);
    } catch (error) {
      return res.status(500).json({
        message: "Ошибка загрузки аватарки",
        error: (error as Error).message,
      });
    }
  }

  async uploadTrack(req: Request, res: Response) {
    const id =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const trackFile = files?.track?.[0] || req.file;
    const coverFile = files?.cover?.[0];
    if (!trackFile) {
      return res.status(400).json({ message: "Файл трека не загружен" });
    }
    const { title, description, tags } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Название трека обязательно" });
    }
    // Преобразуем tags в массив строк, если нужно
    let tagsArray: string[] | undefined = undefined;
    if (tags) {
      if (Array.isArray(tags)) tagsArray = tags;
      else if (typeof tags === "string") tagsArray = [tags];
    }
    const serviceResponse = await meService.uploadTrack(
      id,
      trackFile.buffer,
      trackFile.originalname,
      trackFile.mimetype,
      title,
      description,
      tagsArray,
      coverFile ? coverFile.buffer : undefined,
      coverFile ? coverFile.originalname : undefined,
      coverFile ? coverFile.mimetype : undefined
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async getMyTracks(req: Request, res: Response) {
    const id =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const serviceResponse = await meService.getMyTracks(id);
    return handleServiceResponse(serviceResponse, res);
  }

  async deleteMyTrack(req: Request, res: Response) {
    const id =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const { trackId } = req.body;
    console.log(id, trackId);
    if (!trackId) {
      return res.status(400).json({ message: "trackId обязателен" });
    }
    const serviceResponse = await meService.deleteMyTrack(id, Number(trackId));
    return handleServiceResponse(serviceResponse, res);
  }

  async updateMyTrack(req: Request, res: Response) {
    const id =
      typeof req.user === "object" && req.user !== null && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const trackFile = files?.track?.[0];
    const coverFile = files?.cover?.[0];
    const { trackId, title, description, tags } = req.body;
    if (!trackId) {
      return res.status(400).json({ message: "trackId обязателен" });
    }
    let tagsArray: string[] | undefined = undefined;
    if (tags) {
      if (Array.isArray(tags)) tagsArray = tags;
      else if (typeof tags === "string") tagsArray = [tags];
    }
    const serviceResponse = await meService.updateMyTrack(id, Number(trackId), {
      title,
      description,
      tags: tagsArray,
      fileBuffer: trackFile ? trackFile.buffer : undefined,
      fileOriginalName: trackFile ? trackFile.originalname : undefined,
      fileMimetype: trackFile ? trackFile.mimetype : undefined,
      coverBuffer: coverFile ? coverFile.buffer : undefined,
      coverOriginalName: coverFile ? coverFile.originalname : undefined,
      coverMimetype: coverFile ? coverFile.mimetype : undefined,
    });
    return handleServiceResponse(serviceResponse, res);
  }
}

export const meController = new MeController();
