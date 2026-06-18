import prisma from "@/lib/prisma";

/**
 * Record an activity entry for a task mutation. Never throws into the caller —
 * a failed activity log should not roll back the request.
 *
 * Also increments Task.activityCount as a cheap denormalized counter.
 */
export async function logActivity({ taskId, actor, type, metadata = {} }) {
  try {
    await Promise.all([
      prisma.activity.create({ data: { taskId, actorId: actor, type, metadata } }),
      prisma.task.update({ where: { id: taskId }, data: { activityCount: { increment: 1 } } }),
    ]);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
