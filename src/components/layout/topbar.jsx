"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MobileNav } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar({ user }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/tasks?q=${encodeURIComponent(q)}` : "/tasks");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-8">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetTitle>Navigation</SheetTitle>
          <MobileNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Global search */}
      <form onSubmit={onSearch} className="relative hidden flex-1 sm:block sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks…"
          className="pl-9"
        />
      </form>

      <div className="flex flex-1 items-center justify-end gap-1 sm:flex-none">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Search"
          onClick={() => router.push("/tasks")}
        >
          <Search className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <NotificationDropdown />
        <div className="ml-1">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
