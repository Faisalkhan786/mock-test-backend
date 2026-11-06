import { createApp } from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import "./models"; // register models + associations

async function main() {
  await connectDb();
  // Schema is managed by migrations now (run `npm run migrate` before start).
  // No auto-sync in the app so production data is never altered accidentally.
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`🚀 API running on http://localhost:${env.port}`);
  });
}

main().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});
