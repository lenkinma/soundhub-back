import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { UserService } from "./userService";
import { trackService } from "@/api/track/trackService";

const userServiceInstance = new UserService();

class UserController {
  async getUsers(req: Request, res: Response) {
    const sortBy =
      req.query.sortBy === "likes" || req.query.sortBy === "subscribers"
        ? req.query.sortBy
        : undefined;
    const name = req.query.name ? String(req.query.name) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const serviceResponse = await userService.findAll(
      sortBy as any,
      name,
      limit,
      offset
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async getUser(req: Request, res: Response) {
    const id = Number.parseInt(req.params.id as string, 10);
    let currentUserId: number | undefined = undefined;
    if (req.user && typeof req.user === "object" && "id" in req.user) {
      currentUserId = Number((req.user as any).id);
    }
    const serviceResponse = await userService.findById(id, currentUserId);
    return handleServiceResponse(serviceResponse, res);
  }

  async updateUser(req: Request, res: Response) {
    // id из параметров
    const id = Number.parseInt(req.params.id as string, 10);
    // id из авторизации

    const user = req.user;
    const serviceResponse = await userService.updateUser(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  }

  async deleteUser(req: Request, res: Response) {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.deleteUser(id);
    return handleServiceResponse(serviceResponse, res);
  }

  async getUserTracks(req: Request, res: Response) {
    const requestedUserId = Number.parseInt(req.params.id as string, 10);
    const currentUserId =
      req.user && typeof req.user === "object" && "id" in req.user
        ? (req.user as any).id
        : undefined;
    const serviceResponse = await trackService.getTracksByUserId(
      requestedUserId,
      currentUserId
    );
    return handleServiceResponse(serviceResponse, res);
  }
}

export const userController = new UserController();
