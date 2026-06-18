import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default async function AuthLayout({ children }) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="grid flex-1 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <Logo href="/" className="relative text-primary-foreground" />
          <div className="relative">
            <h2 className="text-3xl font-bold leading-tight">
              The calm, focused home for your team&apos;s work.
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Create tasks, assign them to teammates, and watch progress move
              from Todo to Done — all in one beautifully simple workspace.
            </p>
          </div>
          <p className="relative text-sm text-primary-foreground/70">
            Manage. Assign. Complete.
          </p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo href="/" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
