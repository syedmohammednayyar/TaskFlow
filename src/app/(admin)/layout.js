import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Shield, ArrowLeft } from "lucide-react";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin header */}
      <header className="sticky top-0 z-40 border-b bg-card shadow-sm">
        <div className="flex h-14 items-center gap-4 px-6">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Shield className="h-5 w-5" />
            <span>Admin Portal</span>
          </div>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground hidden sm:block">
            Signed in as <span className="font-medium text-foreground">{session.user.email}</span>
          </span>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to App
          </Link>
        </div>
      </header>

      <main className="container max-w-7xl px-4 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
