import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema, formatZodError } from "@/lib/validations";
import { isValidObjectId, isTaskCreator } from "@/lib/authz";
import { serializeComment } from "@/lib/serialize";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api";

const AUTHOR_SELECT = { id: true, name: true, email: true, avatar: true };

// PATCH /api/comments/:id — edit body (author only)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound("Comment not found");

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid comment", formatZodError(parsed.error));
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!comment) return notFound("Comment not found");
    if (comment.authorId !== userId) {
      return forbidden("Only the comment author can edit this comment");
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { body: parsed.data.body, editedAt: new Date() },
      include: { author: { select: AUTHOR_SELECT } },
    });

    return ok(serializeComment(updated));
  } catch (err) {
    console.error("Comment PATCH error:", err);
    return serverError();
  }
}

// DELETE /api/comments/:id — author or task creator may delete
export async function DELETE(_request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;
    const { id } = await params;
    if (!isValidObjectId(id)) return notFound("Comment not found");

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, taskId: true },
    });
    if (!comment) return notFound("Comment not found");

    const isAuthor = comment.authorId === userId;
    if (!isAuthor) {
      const task = await prisma.task.findUnique({
        where: { id: comment.taskId },
        select: { createdById: true, assignedToId: true },
      });
      if (!task || !isTaskCreator(task, userId)) {
        return forbidden("Only the comment author or task creator can delete this comment");
      }
    }

    await prisma.comment.delete({ where: { id } });
    return ok({ id });
  } catch (err) {
    console.error("Comment DELETE error:", err);
    return serverError();
  }
}
