import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api";

/**
 * GET /api/stats — dashboard counters scoped to the current user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;

    const now = new Date();
    const mine = { OR: [{ createdById: userId }, { assignedToId: userId }] };

    const [total, assignedToMe, completed, overdue, inProgress, todo] = await Promise.all([
      prisma.task.count({ where: mine }),
      prisma.task.count({ where: { assignedToId: userId } }),
      prisma.task.count({ where: { ...mine, status: "Completed" } }),
      prisma.task.count({
        where: { ...mine, status: { not: "Completed" }, dueDate: { not: null, lt: now } },
      }),
      prisma.task.count({ where: { ...mine, status: "In Progress" } }),
      prisma.task.count({ where: { ...mine, status: "Todo" } }),
    ]);

    return ok({ total, assignedToMe, completed, overdue, inProgress, todo });
  } catch (err) {
    console.error("Stats GET error:", err);
    return serverError();
  }
}
