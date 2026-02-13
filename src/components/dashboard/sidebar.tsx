"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "HomeIcon",
  },
  {
    title: "Mock Interviews",
    href: "/interviews",
    icon: "VideoIcon",
  },
  {
    title: "My Profile",
    href: "/profile",
    icon: "UserIcon",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "SettingsIcon",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white p-4 shadow-sm">
      <nav className="space-y-2">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
              pathname === link.href
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {link.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
