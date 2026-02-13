"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const OTP_LENGTH = 6;

export function OTPVerificationForm() {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimeout > 0) {
      timer = setInterval(() => {
        setResendTimeout((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimeout]);

  const setRef = (element: HTMLInputElement | null, index: number) => {
    inputRefs.current[index] = element;
  };

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    const newOtp = [...otp];

    pastedData.split("").forEach((value, index) => {
      newOtp[index] = value;
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = value;
      }
    });

    setOtp(newOtp);
    if (inputRefs.current[pastedData.length - 1]) {
      inputRefs.current[pastedData.length - 1]?.focus();
      setActiveInput(pastedData.length - 1);
    }
  };

  const handleResend = async () => {
    if (!email || resendTimeout > 0 || isResending) return;

    try {
      setIsResending(true);
      const response = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setResendTimeout(data.remainingSeconds || 60);
          throw new Error("Please wait before requesting another code");
        }
        throw new Error(data.error || "Failed to resend code");
      }

      // Clear current OTP inputs
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setActiveInput(0);

      // Set timeout for next resend
      setResendTimeout(60);

      toast.success("New verification code sent!", {
        description: "Please check your email for the new code",
        duration: 5000,
      });
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to resend code",
        {
          icon: <XCircle className="h-5 w-5 text-destructive" />,
          duration: 5000,
        },
      );
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    if (!userId) {
      toast.error("Invalid verification link", {
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        description: "Please try signing up again",
        duration: 5000,
        className: "bg-destructive/5 text-destructive border-destructive/20",
      });
      return;
    }

    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) {
      toast.error("Invalid OTP code", {
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        description: "Please enter a valid 6-digit code",
        duration: 5000,
        className: "bg-destructive/5 text-destructive border-destructive/20",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otpValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast.success("Account verified successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        description: "You can now sign in to your account",
        duration: 5000,
        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        action: {
          label: "Sign In",
          onClick: () => router.push("/login"),
        },
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed", {
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        description: "Please try again or request a new code",
        duration: 5000,
        className: "bg-destructive/5 text-destructive border-destructive/20",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Card className="mx-auto w-full max-w-[440px] border-neutral-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Email Verification
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center px-6">
                {otp.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <input
                      ref={(el) => setRef(el, index)}
                      type="text"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className={`mx-2 h-12 w-11 rounded-lg border text-center text-2xl font-bold transition-all duration-200 first:ml-0 last:mr-0 focus:border-primary focus:ring-2 focus:ring-primary/20 ${activeInput === index ? "border-primary shadow-sm" : "border-input"} ${isLoading ? "cursor-not-allowed opacity-50" : ""} hover:border-primary/50`}
                      disabled={isLoading}
                    />
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={verifyOTP}
                className="h-11 w-full font-medium tracking-wide"
                disabled={isLoading || otp.some((digit) => !digit)}
              >
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </motion.div>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              {resendTimeout > 0 ? (
                <span className="font-medium text-muted-foreground/80">
                  Resend available in{" "}
                  <span className="text-primary">{resendTimeout}s</span>
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline disabled:no-underline disabled:opacity-50 disabled:hover:text-primary"
                  disabled={isResending || isLoading || !email}
                >
                  {isResending ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Resend code"
                  )}
                </button>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
