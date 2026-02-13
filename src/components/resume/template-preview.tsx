import { ResumeData, type TemplateType } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { ModernResume } from "./templates/modern";
import { ClassicResume } from "./templates/classic";
import { MinimalistResume } from "./templates/minimalist";
import { sampleData } from "@/lib/templates/preview-generator";
import { Eye, Check } from "lucide-react";

interface TemplatePreviewProps {
  template: TemplateType;
  isSelected: boolean;
  onSelect: (template: TemplateType) => void;
  onPreview: () => void;
  className?: string;
}

export function TemplatePreview({
  template,
  isSelected,
  onSelect,
  onPreview,
  className,
}: TemplatePreviewProps) {
  const TemplateComponent = {
    modern: ModernResume,
    classic: ClassicResume,
    minimalist: MinimalistResume,
  }[template];

  return (
    <div
      onClick={() => onSelect(template)}
      className={cn(
        "group relative aspect-[210/297] w-full cursor-pointer overflow-hidden rounded-lg bg-white text-black",
        "transition-all duration-300 ease-out hover:scale-[1.02]",
        "ring-2",
        isSelected
          ? [
              "shadow-2xl shadow-primary/20 ring-primary",
              "after:absolute after:inset-0 after:z-10",
              "after:bg-gradient-to-br after:from-primary/20 after:via-primary/10 after:to-transparent",
            ]
          : [
              "ring-border/50 hover:ring-primary/50",
              "hover:shadow-xl hover:shadow-primary/10",
            ],
        className,
      )}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute right-3 top-3 z-50 flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 font-medium text-white animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4" />
          <span>Selected</span>
        </div>
      )}

      {/* Template Preview Container */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Template Preview with improved scaling */}
        <div
          className="absolute inset-0"
          style={{
            transform: "scale(0.31)",
            transformOrigin: "top center",
            width: "325%",
            height: "325%",
            left: "-112.5%",
          }}
        >
          <div className="h-full w-full">
            <TemplateComponent data={sampleData} />
          </div>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 z-20 transition-opacity duration-300",
          "opacity-0 group-hover:opacity-100",
          "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
        )}
      />

      {/* Preview Button Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "opacity-0 transition-all duration-300 group-hover:opacity-100",
          "z-30 bg-gradient-to-b from-black/30 via-black/20 to-black/30 backdrop-blur-[2px]",
          isSelected && "bg-opacity-50",
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className={cn(
            "flex items-center gap-2 rounded-full px-6 py-2.5",
            "bg-gradient-to-r from-primary to-primary/90",
            "text-base font-medium text-primary-foreground shadow-lg",
            "transform transition-all duration-300",
            "hover:scale-105 hover:shadow-primary/25",
            "active:scale-95",
          )}
        >
          <Eye className="h-5 w-5" />
          <span>Preview</span>
        </button>
      </div>

      {/* Template Label */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-40 p-3",
          "bg-gradient-to-t from-black/90 to-transparent",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          "transition-all duration-300",
        )}
      >
        <span className="font-medium capitalize text-white">
          {template} Template
        </span>
      </div>

      {/* Selection Indicator Border */}
      {isSelected && (
        <div className="absolute inset-0 z-20 rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background" />
      )}
    </div>
  );
}
