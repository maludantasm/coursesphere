import { z } from "zod";
import { AppError } from "../shared/errors/AppError.js";
import { PasswordHasher } from "../shared/security/passwordHasher.js";
import { TokenService } from "../shared/security/tokenService.js";
import { presentUser } from "./UserPresenter.js";
import type { UserRepository } from "./UserRepository.js";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z.string().min(8, "Password must contain at least 8 characters")
});

export const loginSchema = z.object({
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async register(input: z.infer<typeof registerSchema>) {
    const existingUser = await this.users.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    return this.buildSession(user);
  }

  async login(input: z.infer<typeof loginSchema>) {
    const user = await this.users.findByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    return this.buildSession(user);
  }

  private buildSession(user: Awaited<ReturnType<UserRepository["findById"]>> extends infer U ? NonNullable<U> : never) {
    return {
      token: this.tokenService.sign({ sub: user.id, email: user.email }),
      user: presentUser(user)
    };
  }
}
