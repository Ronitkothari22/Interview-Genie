"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden dark:bg-background">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 h-full w-full opacity-10 dark:opacity-20">
        <div className="animate-gradient-x absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />
      </div>

      <div className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
        {/* Animated 404 text */}
        <motion.h1
          className={cn(
            "bg-clip-text text-8xl font-bold text-transparent",
            "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
            "dark:from-blue-400 dark:via-purple-400 dark:to-pink-400",
            "cursor-default select-none",
          )}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          404
        </motion.h1>

        {/* Animated description */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h2>
          <p className="max-w-prose text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved, deleted, or never existed.
          </p>
        </motion.div>

        {/* Animated buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <Button variant="default" size="lg" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Animated shapes */}
      <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute h-2 w-2 rounded-full",
              "bg-gradient-to-r from-blue-500 to-purple-500",
              "dark:from-blue-400 dark:to-purple-400",
              "opacity-30 dark:opacity-20",
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
