import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidObjectId } from "@/lib/authz";
import { ok, unauthorized, notFound, serverError } from "@/lib/api";

// PATCH /api/notifications/:id — mark a single notification as read.
export async function PATCH(_request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound();

    const result = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true, readAt: new Date() },
    });
    if (result.count === 0) return notFound();

    return ok({ id });
  } catch (err) {
    console.error("Notification PATCH error:", err);
    return serverError();
  }
}
