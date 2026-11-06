import Redis from "ioredis";
import { env } from "./env";

// Single shared Redis client — used for caching, leaderboard (sorted sets),
// and as the backing store for the BullMQ job queue.
export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password, // undefined for local Redis (no auth)
  maxRetriesPerRequest: null, // required by BullMQ
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (e) => console.error("Redis error:", e.message));

// Small helper: cache-aside pattern. Try cache first, else run loader and store.
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit) as T;
  const fresh = await loader();
  await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  return fresh;
}
