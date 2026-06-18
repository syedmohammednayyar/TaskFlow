import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, KanbanSquare, Bell, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/layout/logo";

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "List & Kanban views",
    desc: "See your work as a clean list or drag tasks across a fluid board.",
  },
  {
    icon: Users,
    title: "Assign to your team",
    desc: "Hand off tasks to any teammate and track them through to done.",
  },
  {
    icon: Bell,
    title: "Real-time notifications",
    desc: "Stay in the loop when tasks are assigned, updated, or completed.",
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center py-20 text-center md:py-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Manage. Assign. Complete.
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Task management your team will{" "}
            <span className="gradient-text">actually enjoy</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            TaskFlow is a fast, beautiful way for small teams to create tasks,
            assign them to teammates, and track progress to completion.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free forever ·
            No credit card required
          </p>
        </section>

        <section className="container grid gap-6 pb-24 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} TaskFlow</span>
          <span>Built for teams that ship.</span>
        </div>
      </footer>
    </div>
  );
}
