import { ThemeToggle } from "@/components/theme-toggle";
import { VerticalTestimonials } from "@/components/ui/vertical-testimonials";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Auth Forms */}
      <div className="relative flex items-center justify-center bg-background">
        {/* Logo and Title */}
        <Link
          href="/"
          className="absolute left-8 top-8 flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <Image
            src="/Assets/Images/logos/logo.png"
            alt="Interview Genie Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
            Interview Genie
          </span>
        </Link>

        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[400px] p-8">{children}</div>
      </div>

      {/* Right Side - Testimonials */}
      <div className="relative hidden bg-muted/30 dark:bg-muted/10 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />
        <div className="relative flex w-full flex-col justify-center p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              AI-Powered Interview Preparation
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Join thousands who have improved their interview skills with our
              platform
            </p>
          </div>

          <div className="min-h-0 flex-1">
            <VerticalTestimonials
              className="h-[calc(100vh-12rem)]"
              speed="slow"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
