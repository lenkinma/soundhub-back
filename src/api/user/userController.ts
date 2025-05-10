import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { UserService } from "./userService";

const userServiceInstance = new UserService();

class UserController {
  async getUsers(req: Request, res: Response) {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  }

  async getUser(req: Request, res: Response) {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);

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
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.getUserTracks(id);
    return handleServiceResponse(serviceResponse, res);
  }
}

export const userController = new UserController();
