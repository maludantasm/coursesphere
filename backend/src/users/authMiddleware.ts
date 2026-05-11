import type { NextFunction, Request, Response } from "express";
import { database } from "../database/database.js";
import { AppError } from "../shared/errors/AppError.js";
import { TokenService } from "../shared/security/tokenService.js";
import { UserRepository } from "./UserRepository.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

const users = new UserRepository(database);
const tokens = new TokenService();

export const authMiddleware = async (request: Request, _response: Response, next: NextFunction) => {
  try {
    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication token is missing", 401);
    }

    const token = header.replace("Bearer ", "").trim();
    const payload = tokens.verify(token);
    const user = await users.findById(payload.sub);

    if (!user) {
      throw new AppError("Authenticated user was not found", 401);
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Invalid authentication token", 401));
  }
};
