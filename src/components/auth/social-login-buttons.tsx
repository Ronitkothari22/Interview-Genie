"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { Loader2, Github } from "lucide-react";
import { motion } from "framer-motion";

interface SocialLoginButtonsProps {
  callbackUrl?: string;
  isLoading?: boolean;
}

export function SocialLoginButtons({
  callbackUrl = "/dashboard",
  isLoading: externalLoading = false,
}: SocialLoginButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signIn("google", { callbackUrl, redirect: false });
      if (result?.error) {
        toast.error("Failed to sign in with Google", {
          description: "Please try again later",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google", {
        description: "Please try again later",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setIsGitHubLoading(true);
      const result = await signIn("github", { callbackUrl, redirect: false });
      if (result?.error) {
        toast.error("Failed to sign in with GitHub", {
          description: "Please ensure you have a verified email on GitHub",
        });
      }
    } catch (error) {
      console.error("GitHub login error:", error);
      toast.error("Failed to sign in with GitHub", {
        description: "Please try again later",
      });
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const isButtonsDisabled =
    externalLoading || isGoogleLoading || isGitHubLoading;

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          variant="social"
          disabled={isButtonsDisabled}
          onClick={handleGoogleLogin}
          className="relative h-11 w-full font-medium"
        >
          <motion.div
            className="flex w-full items-center justify-center"
            initial={false}
            animate={isGoogleLoading ? { opacity: 0 } : { opacity: 1 }}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Continue with Google
          </motion.div>
          {isGoogleLoading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.div>
          )}
        </Button>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          variant="social"
          disabled={isButtonsDisabled}
          onClick={handleGitHubLogin}
          className="relative h-11 w-full font-medium"
        >
          <motion.div
            className="flex w-full items-center justify-center"
            initial={false}
            animate={isGitHubLoading ? { opacity: 0 } : { opacity: 1 }}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </motion.div>
          {isGitHubLoading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.div>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
