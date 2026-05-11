import type { UserRecord } from "../database/schema.js";

export const presentUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
