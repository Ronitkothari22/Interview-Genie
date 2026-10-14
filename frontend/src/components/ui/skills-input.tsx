import React, { useState, useRef, type KeyboardEvent } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function SkillsInput({
  value = [],
  onChange,
  placeholder = "Type a skill and press Enter or comma",
  className,
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure value is always an array
  const skills = Array.isArray(value) ? value : [];

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      onChange([...skills, trimmedSkill]);
    }
    setInputValue("");
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
      const lastSkill = skills[skills.length - 1];
      if (lastSkill) {
        removeSkill(lastSkill);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || "";
    if (newValue.includes(",")) {
      const skills = newValue.split(",");
      skills.forEach((skill) => addSkill(skill));
    } else {
      setInputValue(newValue);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-[42px] flex-wrap gap-2 rounded-md border border-input bg-background p-2 ring-offset-background",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {skills.map((skill) => (
        <span
          key={skill}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium",
            "bg-gradient-to-br from-primary/10 via-primary/20 to-transparent",
            "border border-primary/20 transition-colors hover:border-primary/40",
          )}
        >
          {skill}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeSkill(skill);
            }}
            className="rounded-full p-0.5 transition-colors hover:bg-background/80 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={skills.length === 0 ? placeholder : ""}
        className="min-w-[200px] flex-1 !border-0 bg-transparent !ring-0 !ring-offset-0 focus-visible:ring-0"
      />
    </div>
  );
}
