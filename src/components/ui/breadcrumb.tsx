"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-2 text-base text-muted-foreground",
        className
      )}
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="group flex items-center transition-all duration-300 hover:text-primary"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-1.5 transition-all duration-300 group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-primary/5"
            >
              <Home className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
            </motion.div>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center space-x-2">
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
            <Link
              href={item.href}
              className={cn(
                "group flex items-center space-x-3 transition-all duration-300",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.icon && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-1.5 transition-all duration-300 group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-primary/5"
                >
                  <item.icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                </motion.div>
              )}
              <span className="relative font-medium transition-colors">
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
                  />
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
