import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { taskSchema, formatZodError } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { serializeTask } from "@/lib/serialize";
import { ok, created, badRequest, unauthorized, serverError } from "@/lib/api";

const TASK_INCLUDE = {
  createdBy: { select: { id: true, name: true, email: true, avatar: true } },
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
};

/**
 * GET /api/tasks
 * Query params:
 *   scope    = all | mine | assigned   (default: all involving me)
 *   status   = Todo | In Progress | Completed
 *   priority = Low | Medium | High
 *   q        = free-text search on title/description
 *   archived = true (default: false — exclude archived)
 *   page     = 1-based page number (default: 1)
 *   limit    = items per page, max 100 (default: 50)
 *   sortBy   = field name (default: createdAt)
 *   order    = asc | desc (default: desc)
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "all";
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const q = searchParams.get("q");
    const showArchived = searchParams.get("archived") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const where = {};

    if (!showArchived) where.archived = false;

    if (scope === "mine") {
      where.createdById = userId;
    } else if (scope === "assigned") {
      where.assignedToId = userId;
    } else {
      where.OR = [{ createdById: userId }, { assignedToId: userId }];
    }

    if (status && status !== "All") where.status = status;
    if (priority && priority !== "All") where.priority = priority;

    if (q?.trim()) {
      const searchOR = [
        { title: { contains: q.trim(), mode: "insensitive" } },
        { description: { contains: q.trim(), mode: "insensitive" } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: TASK_INCLUDE,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return ok({
      items: items.map(serializeTask),
      page,
      limit,
      total,
      hasMore: skip + items.length < total,
    });
  } catch (err) {
    console.error("Tasks GET error:", err);
    return serverError();
  }
}

/**
 * POST /api/tasks — create a task and notify the assignee.
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;

    const body = await request.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please fix the highlighted fields", formatZodError(parsed.error));
    }

    const { title, description, priority, status, dueDate, assignedTo } = parsed.data;

    const assignee = await prisma.user.findUnique({
      where: { id: assignedTo },
      select: { id: true },
    });
    if (!assignee) {
      return badRequest("Assigned user does not exist", { assignedTo: "Select a valid user" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: userId,
        assignedToId: assignedTo,
      },
      include: TASK_INCLUDE,
    });

    await Promise.all([
      createNotification({
        userId: assignedTo,
        actor: userId,
        type: "assigned",
        task: task.id,
        message: `${session.user.name} assigned you a task: "${title}"`,
      }),
      logActivity({ taskId: task.id, actor: userId, type: "task_created" }),
    ]);

    return created(serializeTask(task));
  } catch (err) {
    console.error("Tasks POST error:", err);
    return serverError("Could not create the task.");
  }
}
