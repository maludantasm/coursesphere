import crypto from "node:crypto";
import type { JsonDatabase } from "../database/JsonDatabase.js";
import type { UserRecord } from "../database/schema.js";

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export class UserRepository {
  constructor(private readonly database: JsonDatabase) {}

  async findById(id: string) {
    const data = await this.database.read();
    return data.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string) {
    const data = await this.database.read();
    return data.users.find((user) => user.email === email.toLowerCase()) ?? null;
  }

  create(input: CreateUserInput) {
    return this.database.transaction((data) => {
      const now = new Date().toISOString();
      const user: UserRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        createdAt: now,
        updatedAt: now
      };

      data.users.push(user);
      return user;
    });
  }
}
