import { Request, RequestHandler, Response } from 'express';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { AuthService } from './authService';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const serviceResponse = await authService.login(email, password);
    return handleServiceResponse(serviceResponse, res);
  }

  async registerNewUser(req: Request, res: Response) {
		const serviceResponse = await authService.registerNewUser(req.body);
		return handleServiceResponse(serviceResponse, res);
	};

}

export const authController = new AuthController(); 