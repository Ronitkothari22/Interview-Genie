import { useState } from "react";
import { type TemplateType } from "@/lib/types/resume";
import { TemplatePreview } from "./template-preview";
import { TemplatePreviewDialog } from "./template-preview-dialog";

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  className?: string;
}

const availableTemplates: TemplateType[] = ["modern", "classic", "minimalist"];

export function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
  className,
}: TemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(
    null,
  );

  const handlePreview = (template: TemplateType) => {
    setPreviewTemplate(template);
  };

  const handleSelect = (template: TemplateType) => {
    onTemplateChange(template);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableTemplates.map((template) => (
          <TemplatePreview
            key={template}
            template={template}
            isSelected={template === selectedTemplate}
            onSelect={handleSelect}
            onPreview={() => handlePreview(template)}
          />
        ))}
      </div>

      {previewTemplate && (
        <TemplatePreviewDialog
          template={previewTemplate}
          isOpen={true}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
