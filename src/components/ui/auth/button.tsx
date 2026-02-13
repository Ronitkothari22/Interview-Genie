"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "className" | "children"> {
  variant?: "default" | "outline" | "social";
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      isLoading,
      disabled,
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "group/btn relative flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90":
              variant === "default",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground":
              variant === "outline" || variant === "social",
            "justify-start px-4": variant === "social",
          },
          className,
        )}
        disabled={disabled ?? isLoading}
        whileHover={!(disabled || isLoading) ? "hover" : undefined}
        {...props}
      >
        {icon}
        {children}
        <motion.span
          className="absolute inset-x-0 -bottom-px h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ opacity: 0 }}
          variants={{
            hover: {
              opacity: 1,
              transition: {
                duration: 0.3,
              },
            },
          }}
        />
        <motion.span
          className="absolute inset-x-10 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm"
          initial={{ opacity: 0 }}
          variants={{
            hover: {
              opacity: 1,
              transition: {
                duration: 0.3,
              },
            },
          }}
        />
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export { Button };
