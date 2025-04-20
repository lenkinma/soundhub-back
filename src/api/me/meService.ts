import { ServiceResponse } from "@/common/models/serviceResponse";
import prisma from "@/db/prisma";
import { StatusCodes } from "http-status-codes";
import { MeResponse } from "./meModel";
import { logger } from "@/server";




export class MeService {


    async getMe(id: number): Promise<ServiceResponse<MeResponse | null>> {
        try {
			const user = await prisma.user.findUnique({
				where: { id: id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    bio: true,
                    createdAt: true,
                    updatedAt: true,
                }
			});

			
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<MeResponse>("User found", user as MeResponse);
		} catch (ex) {
			const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
    }
}


export const meService = new MeService();
