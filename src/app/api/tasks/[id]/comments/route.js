import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema, formatZodError } from "@/lib/validations";
import { isValidObjectId, canViewTask } from "@/lib/authz";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { serializeComment } from "@/lib/serialize";
import { ok, created, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api";

const AUTHOR_SELECT = { id: true, name: true, email: true, avatar: true };

// GET /api/tasks/:id/comments
export async function GET(_request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound("Task not found");

    const task = await prisma.task.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true },
    });
    if (!task) return notFound("Task not found");
    if (!canViewTask(task, session.user.id)) return forbidden();

    const comments = await prisma.comment.findMany({
      where: { taskId: id },
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: { createdAt: "asc" },
    });

    return ok({ items: comments.map(serializeComment) });
  } catch (err) {
    console.error("Comments GET error:", err);
    return serverError();
  }
}

// POST /api/tasks/:id/comments
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound("Task not found");

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid comment", formatZodError(parsed.error));
    }

    const task = await prisma.task.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true, title: true },
    });
    if (!task) return notFound("Task not found");
    if (!canViewTask(task, userId)) return forbidden();

    const comment = await prisma.comment.create({
      data: { taskId: id, authorId: userId, body: parsed.data.body },
      include: { author: { select: AUTHOR_SELECT } },
    });

    // Notify the other party (skip when self-assigned).
    const notifyId = userId === task.createdById ? task.assignedToId : task.createdById;
    await Promise.all([
      notifyId !== userId
        ? createNotification({
            userId: notifyId,
            actor: userId,
            type: "updated",
            task: id,
            message: `${session.user.name} commented on "${task.title}"`,
            metadata: { commentId: comment.id },
          })
        : Promise.resolve(),
      logActivity({
        taskId: id,
        actor: userId,
        type: "comment_added",
        metadata: { commentId: comment.id },
      }),
    ]);

    return created(serializeComment(comment));
  } catch (err) {
    console.error("Comments POST error:", err);
    return serverError();
  }
}
