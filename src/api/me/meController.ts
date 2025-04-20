
import type { Request, RequestHandler, Response } from "express";
import { meService } from "./meService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class MeController {
    async getMe(req: Request, res: Response) {

        const id = req.user?.id;
        const serviceResponse = await meService.getMe(id);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const meController = new MeController();
