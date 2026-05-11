import type { Request, Response } from "express";
import { loginSchema, registerSchema, type AuthService } from "./AuthService.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: Request, response: Response) => {
    const payload = registerSchema.parse(request.body);
    const session = await this.authService.register(payload);
    return response.status(201).json(session);
  };

  login = async (request: Request, response: Response) => {
    const payload = loginSchema.parse(request.body);
    const session = await this.authService.login(payload);
    return response.status(200).json(session);
  };
}
