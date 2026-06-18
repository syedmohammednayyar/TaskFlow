import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api";

// List all registered users (for task assignment pickers).
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, avatar: true },
      orderBy: { name: "asc" },
    });

    return ok(users);
  } catch (err) {
    console.error("Users GET error:", err);
    return serverError();
  }
}
