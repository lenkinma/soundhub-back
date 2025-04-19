import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { UserService } from './userService';

const userServiceInstance = new UserService();

class UserController {
	public getUsers: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await userService.findAll();
		return handleServiceResponse(serviceResponse, res);
		
	};

	public getUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.findById(id);
		
		return handleServiceResponse(serviceResponse, res);
		
	};

	public createUser: RequestHandler = async (req: Request, res: Response) => {
		const serviceResponse = await userService.createUser(req.body);
		return handleServiceResponse(serviceResponse, res);
	};

	public updateUser: RequestHandler = async (req: Request, res: Response) => {
		// id из параметров 
		const id = Number.parseInt(req.params.id as string, 10);
		// id из авторизации
		// const user = req.user;
		const serviceResponse = await userService.updateUser(id, req.body);
		return handleServiceResponse(serviceResponse, res);
	};

	public deleteUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.deleteUser(id);
		return handleServiceResponse(serviceResponse, res);
	};

	async getProfile(req: Request, res: Response) {
		if (!req.user || typeof req.user === 'string') {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		const user = await userServiceInstance.getUserById(req.user.id);
		res.json(user);
	}
}

export const userController = new UserController();
