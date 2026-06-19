import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { resetPasswordSchema, formatZodError } from "@/lib/validations";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please fix the highlighted fields", formatZodError(parsed.error));
    }

    const { token, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return badRequest("This reset link is invalid or has expired. Please request a new one.");
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return ok({ message: "Your password has been reset. You can now log in." });
  } catch (err) {
    console.error("Reset-password error:", err);
    return serverError("Something went wrong. Please try again.");
  }
}
