#!/usr/bin/env node
/**
 * Run prisma migrate deploy only when pending migrations exist.
 * Skips the advisory lock when the schema is already current (common on Vercel).
 * Retries on transient Supabase pooler lock timeouts when deploy is needed.
 */
import { execSync } from "node:child_process";

const attempts = 3;
const delayMs = 15_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function migrationsPending() {
  try {
    execSync("npx prisma migrate status", { stdio: "pipe" });
    return false;
  } catch {
    return true;
  }
}

async function main() {
  if (!migrationsPending()) {
    console.log("[migrate-deploy] database schema is up to date — skipping deploy");
    return;
  }

  console.log("[migrate-deploy] pending migrations detected — running deploy");

  for (let i = 1; i <= attempts; i++) {
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      return;
    } catch {
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
