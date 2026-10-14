import { Label } from "@/components/ui/label";
import { type TabId, isFieldRequired, type FieldMap } from "@/lib/resume-tabs";

interface RequiredFieldLabelProps<T extends TabId> {
  tabId: T;
  fieldName: keyof FieldMap[T];
  children: React.ReactNode;
}

export function RequiredFieldLabel<T extends TabId>({
  tabId,
  fieldName,
  children,
}: RequiredFieldLabelProps<T>) {
  const required = isFieldRequired(tabId, fieldName);

  return (
    <Label>
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </Label>
  );
}
