import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createEmptyDatabase, type DatabaseSchema } from "./schema.js";

type Mutation<T> = (database: DatabaseSchema) => T | Promise<T>;

export class JsonDatabase {
  private queue = Promise.resolve();
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = resolve(filePath);
  }

  async read(): Promise<DatabaseSchema> {
    return this.load();
  }

  async transaction<T>(mutation: Mutation<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const database = await this.load();
      const result = await mutation(database);
      await this.persist(database);
      return result;
    });

    this.queue = run.then(
      () => undefined,
      () => undefined
    );

    return run;
  }

  private async load(): Promise<DatabaseSchema> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as DatabaseSchema;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return createEmptyDatabase();
      }

      throw error;
    }
  }

  private async persist(database: DatabaseSchema) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(database, null, 2));
  }
}
