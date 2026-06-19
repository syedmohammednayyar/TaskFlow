import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== "admin") return forbidden();
  return null;
}

const updateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
  role: z.enum(["member", "admin"]).optional(),
  isActive: z.boolean().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number")
    .optional()
    .or(z.literal("")),
});

/** PATCH /api/admin/users/[id] — update a user */
export async function PATCH(request, { params }) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key && !errors[key]) errors[key] = issue.message;
      }
      return badRequest("Please fix the highlighted fields", errors);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");

    const { password, email, ...rest } = parsed.data;

    // Check email uniqueness if changing email
    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return badRequest("Email already in use", { email: "Email is already registered" });
    }

    const data = { ...rest };
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, avatar: true,
        role: true, isActive: true, lastLogin: true, createdAt: true,
        _count: { select: { tasksCreated: true, tasksAssigned: true } },
      },
    });

    return ok(user);
  } catch (err) {
    console.error("Admin update user error:", err);
    return serverError();
  }
}

/** DELETE /api/admin/users/[id] — remove a user */
export async function DELETE(request, { params }) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { id } = await params;

    // Prevent admin from deleting themselves
    const session = await auth();
    if (session.user.id === id) {
      return badRequest("You cannot delete your own account");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound("User not found");

    await prisma.user.delete({ where: { id } });
    return ok({ id });
  } catch (err) {
    // Foreign key constraint — user has tasks assigned to them
    if (err.code === "P2003" || err.code === "P2014") {
      return badRequest(
        "This user has tasks assigned to them. Reassign or delete those tasks first."
      );
    }
    console.error("Admin delete user error:", err);
    return serverError();
  }
}
