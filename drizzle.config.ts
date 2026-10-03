import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: ["./db/schema.ts", "./db/play-auth.ts", "./db/play-competition.ts", "./db/play-courts.ts", "./db/play-discovery.ts", "./db/play-social.ts", "./db/play-pilot.ts"],
  dialect: "sqlite",
});
