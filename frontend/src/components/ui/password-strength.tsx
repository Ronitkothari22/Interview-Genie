"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const calculateStrength = () => {
      let score = 0;
      if (!password) return 0;

      // Length check
      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;

      // Character type checks
      if (/[A-Z]/.test(password)) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;

      return Math.min(score, 4);
    };

    const strength = calculateStrength();
    setStrength(strength);

    const messages = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    setMessage(messages[strength] ?? "");
  }, [password]);

  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full space-x-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-full w-1/4 rounded-full transition-all duration-300",
              {
                "bg-red-500": strength === 1 && i === 0,
                "bg-orange-500": strength === 2 && i <= 1,
                "bg-yellow-500": strength === 3 && i <= 2,
                "bg-green-500": strength === 4 && i <= 3,
                "bg-gray-200": i >= strength,
              },
            )}
          />
        ))}
      </div>
      <p
        className={cn("text-xs", {
          "text-red-500": strength === 1,
          "text-orange-500": strength === 2,
          "text-yellow-500": strength === 3,
          "text-green-500": strength === 4,
        })}
      >
        {message}
      </p>
    </div>
  );
}
