import { AppError } from "../errors/AppError.js";

export const requiredParam = (value: string | string[] | undefined, name: string) => {
  if (typeof value !== "string" || !value) {
    throw new AppError(`Route parameter ${name} is required`, 400);
  }

  return value;
};
