import { Request, Response } from 'express';
import { UserService } from '../user/userService';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

const userService = new UserService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const serviceResponse = await userService.login(email, password);
    return handleServiceResponse(serviceResponse, res);
  }

}

export const authController = new AuthController(); 