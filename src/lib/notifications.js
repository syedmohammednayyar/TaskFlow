import prisma from "@/lib/prisma";

/**
 * Create an in-app notification. Never throws into the request path —
 * a failed notification should not roll back the task action.
 */
export async function createNotification({ userId, type, message, task, actor, metadata }) {
  try {
    // Don't notify users about their own actions.
    if (actor && actor === userId) return null;
    return await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        taskId: task || null,
        actorId: actor || null,
        metadata: metadata || {},
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
}
