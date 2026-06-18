import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidObjectId, canViewTask } from "@/lib/authz";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/api";

// GET /api/tasks/:id/activity — newest-first, paginated
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound("Task not found");

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const task = await prisma.task.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true },
    });
    if (!task) return notFound("Task not found");
    if (!canViewTask(task, session.user.id)) return forbidden();

    const activities = await prisma.activity.findMany({
      where: { taskId: id },
      include: { actor: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const items = activities.map((a) => ({
      id: a.id,
      type: a.type,
      metadata: a.metadata || {},
      actor: a.actor ? { id: a.actor.id, name: a.actor.name, avatar: a.actor.avatar } : null,
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    }));

    return ok({ items });
  } catch (err) {
    console.error("Activity GET error:", err);
    return serverError();
  }
}
