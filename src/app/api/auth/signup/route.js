import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateAvatar } from "@/lib/utils";
import { signupSchema, formatZodError } from "@/lib/validations";
import { created, badRequest, serverError } from "@/lib/api";

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please fix the highlighted fields", formatZodError(parsed.error));
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return badRequest("An account with this email already exists", {
        email: "Email is already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const avatar = generateAvatar(name);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, avatar },
    });

    return created({ id: user.id, name: user.name, email: user.email, avatar: user.avatar });
  } catch (err) {
    console.error("Signup error:", err);
    return serverError("Could not create your account. Please try again.");
  }
}
