import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "error" | "not_configured"> = {
    postgres: "error",
    redis: "not_configured",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = "ok";
  } catch {
    checks.postgres = "error";
  }

  const redis = getRedis();
  if (redis) {
    try {
      await redis.ping();
      checks.redis = "ok";
    } catch {
      checks.redis = "error";
    }
  }

  const healthy = checks.postgres === "ok" && checks.redis !== "error";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", service: "likha", checks },
    { status: healthy ? 200 : 503 },
  );
}
