import { Router } from "express";
import { database } from "../database/database.js";
import { asyncHandler } from "../shared/http/asyncHandler.js";
import { PasswordHasher } from "../shared/security/passwordHasher.js";
import { TokenService } from "../shared/security/tokenService.js";
import { AuthController } from "./AuthController.js";
import { AuthService } from "./AuthService.js";
import { UserRepository } from "./UserRepository.js";

const users = new UserRepository(database);
const authService = new AuthService(users, new PasswordHasher(), new TokenService());
const authController = new AuthController(authService);

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
