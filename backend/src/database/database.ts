import { env } from "../config/env.js";
import { JsonDatabase } from "./JsonDatabase.js";

export const database = new JsonDatabase(env.DATA_FILE);
