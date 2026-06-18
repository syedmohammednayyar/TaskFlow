import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serializeNotification } from "@/lib/serialize";
import { ok, unauthorized, serverError } from "@/lib/api";

// GET /api/notifications — recent notifications + unread count.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        include: { actor: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return ok({ items: items.map(serializeNotification), unreadCount });
  } catch (err) {
    console.error("Notifications GET error:", err);
    return serverError();
  }
}

// PATCH /api/notifications — mark all as read.
export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return ok({ unreadCount: 0 });
  } catch (err) {
    console.error("Notifications PATCH error:", err);
    return serverError();
  }
}
