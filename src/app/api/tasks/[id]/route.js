import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { taskSchema, formatZodError } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { serializeTask } from "@/lib/serialize";
import { isValidObjectId, canViewTask, isTaskCreator } from "@/lib/authz";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api";

const TASK_INCLUDE = {
  createdBy: { select: { id: true, name: true, email: true, avatar: true } },
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
};

// GET /api/tasks/:id
export async function GET(_request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound("Task not found");

    const task = await prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
    if (!task) return notFound("Task not found");
    if (!canViewTask(task, session.user.id)) return forbidden();

    return ok(serializeTask(task));
  } catch (err) {
    console.error("Task GET error:", err);
    return serverError();
  }
}

// PATCH /api/tasks/:id — update fields (full edit or partial status change)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound("Task not found");

    // Load just the fields needed for authz + diff.
    const existing = await prisma.task.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true, status: true, title: true },
    });
    if (!existing) return notFound("Task not found");
    if (!canViewTask(existing, userId)) return forbidden();

    const body = await request.json();

    const isStatusOnly = Object.keys(body).length === 1 && typeof body.status === "string";

    if (isStatusOnly) {
      const partial = taskSchema.pick({ status: true }).safeParse(body);
      if (!partial.success) {
        return badRequest("Invalid status", formatZodError(partial.error));
      }
    } else {
      const parsed = taskSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest("Please fix the highlighted fields", formatZodError(parsed.error));
      }
      if (!isTaskCreator(existing, userId)) {
        return forbidden("Only the task creator can edit these details");
      }
      if (parsed.data.assignedTo) {
        const assignee = await prisma.user.findUnique({
          where: { id: parsed.data.assignedTo },
          select: { id: true },
        });
        if (!assignee) {
          return badRequest("Assigned user does not exist", { assignedTo: "Select a valid user" });
        }
      }
    }

    const data = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description || "";
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.status !== undefined) {
      data.status = body.status;
      // completedAt lifecycle (previously a Mongoose pre-save hook).
      if (body.status === "Completed" && existing.status !== "Completed") {
        data.completedAt = new Date();
      } else if (body.status !== "Completed" && existing.status === "Completed") {
        data.completedAt = null;
      }
    }
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (!isStatusOnly && body.assignedTo !== undefined) data.assignedToId = body.assignedTo;

    const task = await prisma.task.update({ where: { id }, data, include: TASK_INCLUDE });

    // Notifications + activity.
    const newAssigneeId = task.assignedToId;
    const activityMeta = {};
    let activityType = "task_updated";

    if (newAssigneeId !== existing.assignedToId) {
      activityType = "assignment_changed";
      activityMeta.from = existing.assignedToId;
      activityMeta.to = newAssigneeId;
      await createNotification({
        userId: newAssigneeId,
        actor: userId,
        type: "assigned",
        task: task.id,
        message: `${session.user.name} assigned you a task: "${task.title}"`,
      });
    } else if (task.status === "Completed" && existing.status !== "Completed") {
      activityType = "task_completed";
      activityMeta.from = existing.status;
      await createNotification({
        userId: task.createdById,
        actor: userId,
        type: "completed",
        task: task.id,
        message: `${session.user.name} completed "${task.title}"`,
      });
    } else if (existing.status !== task.status) {
      activityType =
        task.status === "Todo" && existing.status === "Completed"
          ? "task_reopened"
          : "status_changed";
      activityMeta.from = existing.status;
      activityMeta.to = task.status;
      await createNotification({
        userId: newAssigneeId,
        actor: userId,
        type: "updated",
        task: task.id,
        message: `${session.user.name} moved "${task.title}" to ${task.status}`,
      });
    }

    await logActivity({ taskId: task.id, actor: userId, type: activityType, metadata: activityMeta });

    return ok(serializeTask(task));
  } catch (err) {
    console.error("Task PATCH error:", err);
    return serverError("Could not update the task.");
  }
}

// DELETE /api/tasks/:id — only the creator may delete.
export async function DELETE(_request, { params }) {
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
    if (!isTaskCreator(task, session.user.id)) {
      return forbidden("Only the task creator can delete this task");
    }

    await prisma.task.delete({ where: { id } });
    return ok({ id });
  } catch (err) {
    console.error("Task DELETE error:", err);
    return serverError("Could not delete the task.");
  }
}
