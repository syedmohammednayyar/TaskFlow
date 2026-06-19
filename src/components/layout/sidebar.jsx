"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { m } from "framer-motion";
import { Shield } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {active && (
              <m.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-lg bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <item.icon className="relative h-[18px] w-[18px]" />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AdminLink() {
  const { data: session } = useSession();
  if (session?.user?.role !== "admin") return null;
  return (
    <div className="px-3 mt-1">
      <Link
        href="/admin/users"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Shield className="h-[18px] w-[18px]" />
        Admin Portal
      </Link>
    </div>
  );
}

/** Desktop sidebar (fixed). */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks />
        <div className="mt-4 border-t pt-4">
          <AdminLink />
        </div>
      </div>
      <div className="border-t p-4">
        <p className="px-3 text-xs text-muted-foreground">
          Manage. Assign. Complete.
        </p>
      </div>
    </aside>
  );
}

/** Shared content used inside the mobile drawer. */
export function MobileNav({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks onNavigate={onNavigate} />
        <div className="mt-4 border-t pt-4">
          <AdminLink />
        </div>
      </div>
    </div>
  );
}
