#!/usr/bin/env node
/**
 * Retry prisma migrate deploy — Supabase pooler advisory locks can time out
 * when concurrent builds run or the DB is briefly busy.
 */
import { execSync } from "node:child_process";

const attempts = 3;
const delayMs = 15_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let i = 1; i <= attempts; i++) {
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      return;
    } catch (err) {
      if (i === attempts) {
        console.error("[migrate-deploy] all attempts failed");
        process.exit(1);
      }
      console.warn(
        `[migrate-deploy] attempt ${i}/${attempts} failed; retrying in ${delayMs / 1000}s…`
      );
      await sleep(delayMs);
    }
  }
}

main();
