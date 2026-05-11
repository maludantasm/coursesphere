import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";

type TokenPayload = {
  sub: string;
  email: string;
};

export class TokenService {
  sign(payload: TokenPayload) {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      ...options
    });
  }

  verify(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }
}
