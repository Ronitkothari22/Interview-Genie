"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const testimonials = [
  {
    quote:
      "This AI interview platform helped me land my dream job at Google. The technical interview practice was incredibly realistic!",
    name: "Sarah Chen",
    title: "Software Engineer at Google",
    rating: 5,
  },
  {
    quote:
      "The behavioral interview scenarios were spot-on. I felt much more confident during my actual interviews.",
    name: "Michael Rodriguez",
    title: "Product Manager at Microsoft",
    rating: 5,
  },
  {
    quote:
      "The instant feedback on my responses helped me improve rapidly. Worth every penny!",
    name: "Priya Patel",
    title: "Data Scientist at Amazon",
    rating: 5,
  },
  {
    quote:
      "The system design practice interviews were particularly helpful. Great platform!",
    name: "James Wilson",
    title: "Senior Engineer at Meta",
    rating: 5,
  },
  {
    quote:
      "I love how the AI adapts to my skill level. It's like having a personal interview coach.",
    name: "Emma Thompson",
    title: "Frontend Developer at Spotify",
    rating: 5,
  },
  {
    quote:
      "The variety of interview types and questions kept me well-prepared for anything.",
    name: "David Kim",
    title: "Full Stack Developer at Netflix",
    rating: 5,
  },
  {
    quote: "The detailed feedback on my communication skills was invaluable.",
    name: "Lisa Zhang",
    title: "Engineering Manager at Apple",
    rating: 5,
  },
  {
    quote:
      "Best interview prep tool I've used. The AI's responses feel very natural.",
    name: "Alex Morgan",
    title: "Backend Engineer at Twitter",
    rating: 5,
  },
  {
    quote:
      "Great for practicing both technical and soft skills. Highly recommend!",
    name: "Tom Anderson",
    title: "DevOps Engineer at LinkedIn",
    rating: 5,
  },
  {
    quote:
      "The mock interviews helped me overcome my interview anxiety. Thank you!",
    name: "Nina Patel",
    title: "iOS Developer at Uber",
    rating: 5,
  },
];

export const VerticalTestimonials = ({
  className,
  speed = "slow",
}: {
  className?: string;
  speed?: "fast" | "normal" | "slow";
}) => {
  const [start, setStart] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      if (containerRef.current) {
        if (speed === "fast") {
          containerRef.current.style.setProperty("--animation-duration", "10s");
        } else if (speed === "normal") {
          containerRef.current.style.setProperty("--animation-duration", "15s");
        } else {
          containerRef.current.style.setProperty("--animation-duration", "20s");
        }
      }

      setStart(true);
    }
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "grid grid-cols-2 gap-4 py-4",
          start && "animate-scroll-vertical",
          "hover:[animation-play-state:paused]",
        )}
      >
        {testimonials.map((item, idx) => (
          <div
            key={item.name + idx}
            className="relative rounded-xl border bg-card/30 p-6 shadow-sm backdrop-blur-sm"
          >
            <blockquote className="space-y-4">
              <span className="relative block text-sm leading-relaxed text-foreground/90">
                {item.quote}
              </span>
              <footer className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-foreground">
                  {item.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.title}
                </span>
              </footer>
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
};
