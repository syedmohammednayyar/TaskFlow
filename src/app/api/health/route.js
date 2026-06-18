import prisma from "@/lib/prisma";
import { ok, serverError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — lightweight liveness/readiness probe.
 * Reports process uptime and database connectivity.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({
      status: "ok",
      db: "connected",
      uptime: Math.round(process.uptime()),
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return serverError("Health check failed");
  }
}
