import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type AppDb = NeonHttpDatabase<typeof schema>;

let instance: AppDb | null = null;

export function getDb(): AppDb {
  if (!instance) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    instance = drizzle(neon(url), { schema });
  }
  return instance;
}

/** Lazy DB handle — does not connect until first use (avoids build-time throws on import). */
export const db = new Proxy({} as AppDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
