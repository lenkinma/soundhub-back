import type { Request, Response } from "express";
import { subscriptionService } from "./subscriptionService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class SubscriptionController {
  async subscribe(req: Request, res: Response) {
    const subscriberId = (req.user as any).id;
    const subscribedToId = Number(req.params.id);
    const serviceResponse = await subscriptionService.subscribe(
      subscriberId,
      subscribedToId
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async unsubscribe(req: Request, res: Response) {
    const subscriberId = (req.user as any).id;
    const subscribedToId = Number(req.params.id);
    const serviceResponse = await subscriptionService.unsubscribe(
      subscriberId,
      subscribedToId
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async getSubscribers(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const serviceResponse = await subscriptionService.getSubscribers(
      userId,
      limit,
      offset
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async getSubscriptions(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const serviceResponse = await subscriptionService.getSubscriptions(
      userId,
      limit,
      offset
    );
    return handleServiceResponse(serviceResponse, res);
  }

  async getFeed(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    let currentUserId: number | undefined = undefined;
    if (req.user && typeof req.user === "object" && "id" in req.user) {
      currentUserId = Number((req.user as any).id);
    }
    const serviceResponse = await subscriptionService.getFeed(
      userId,
      limit,
      offset,
      currentUserId
    );
    return handleServiceResponse(serviceResponse, res);
  }
}

export const subscriptionController = new SubscriptionController();
