"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";

export function DashboardNav() {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-2xl font-bold">
          Interview Genie
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
