import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/lib/api";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== "admin") return forbidden();
  return null;
}

const createSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    role: z.enum(["member", "admin"]).default("member"),
  });

/** GET /api/admin/users — list all users */
export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        _count: { select: { tasksCreated: true, tasksAssigned: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(users);
  } catch (err) {
    console.error("Admin list users error:", err);
    return serverError();
  }
}

/** POST /api/admin/users — create a new user */
export async function POST(request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key && !errors[key]) errors[key] = issue.message;
      }
      return badRequest("Please fix the highlighted fields", errors);
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return badRequest("An account with this email already exists", { email: "Email is already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const { generateAvatar } = await import("@/lib/utils");
    const avatar = generateAvatar(name);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, avatar, role },
      select: { id: true, name: true, email: true, avatar: true, role: true, isActive: true, createdAt: true },
    });

    return ok(user);
  } catch (err) {
    console.error("Admin create user error:", err);
    return serverError();
  }
}
