import crypto from "crypto";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema, formatZodError } from "@/lib/validations";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please enter a valid email address", formatZodError(parsed.error));
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success — never reveal whether the email is registered.
    if (!user || user.isActive === false) {
      return ok({ message: "If that email is registered you'll receive a reset link shortly." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // TODO: replace this console.warn with your email provider (e.g. Resend, Nodemailer).
    // Example with Resend:
    //   await resend.emails.send({ from: "...", to: email, subject: "Reset your password", html: `...` });
    if (process.env.NODE_ENV !== "production") {
      console.warn(`\n[DEV] Password reset link for ${email}:\n${resetUrl}\n`);
    }

    return ok({ message: "If that email is registered you'll receive a reset link shortly." });
  } catch (err) {
    console.error("Forgot-password error:", err);
    return serverError("Something went wrong. Please try again.");
  }
}
