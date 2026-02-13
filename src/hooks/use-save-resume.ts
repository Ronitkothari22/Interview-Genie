import { useState } from "react";
import { toast } from "sonner";
import { type TabId } from "@/lib/resume-tabs";
import { validateSection } from "@/lib/validations/resume";

interface SaveResumeOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onValidationError?: (
    errors: Array<{ field: string; message: string }>,
  ) => void;
}

export function useSaveResume(
  resumeId: string,
  options: SaveResumeOptions = {},
) {
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Array<{ field: string; message: string }>
  >([]);

  const saveSection = async (section: TabId, data: any) => {
    setIsSaving(true);
    setValidationErrors([]);

    try {
      console.log(`Saving ${section} section with data:`, data);

      // Transform data based on section
      let transformedData = data;

      if (section === "personal") {
        // Transform personal data to match schema
        transformedData = {
          fullName: data.fullName || data.name,
          jobTitle: data.jobTitle,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedIn: data.linkedIn || "",
          portfolio: data.portfolio || "",
        };
        console.log("Transformed personal data:", transformedData);
      } else if (
        section === "experience" ||
        section === "projects" ||
        section === "education" ||
        section === "certifications" ||
        section === "achievements"
      ) {
        // Transform array sections
        transformedData = Object.values(data)
          .filter((item: any) =>
            // For achievements, require all fields to be non-empty
            section === "achievements"
              ? item?.title?.trim() !== "" &&
                item?.date?.trim() !== "" &&
                item?.description?.trim() !== ""
              : Object.values(item).some((value: any) =>
                  typeof value === "string" ? value.trim() !== "" : !!value,
                ),
          )
          .map((item: any) => ({
            ...item,
            // Only add technologies field for sections that use it
            ...(["experience", "projects"].includes(section)
              ? {
                  technologies: Array.isArray(item.technologies)
                    ? item.technologies
                    : [],
                }
              : {}),
          }));
        console.log("Transformed array section data:", transformedData);
      } else if (section === "skills") {
        // Transform skills data
        transformedData = {
          technical: Array.isArray(data.technical)
            ? data.technical.filter(Boolean)
            : [],
          soft: Array.isArray(data.soft) ? data.soft.filter(Boolean) : [],
          tools: Array.isArray(data.tools) ? data.tools.filter(Boolean) : [],
        };
        console.log("Transformed skills data:", transformedData);
      }

      // Validate the data before sending to the server
      const validationResult = validateSection(section, transformedData);
      console.log(`Validation result for ${section}:`, validationResult);

      if (!validationResult.success) {
        const errors = validationResult.errors || [];
        console.log(`Validation errors for ${section}:`, errors);
        setValidationErrors(errors);
        options.onValidationError?.(errors);
        toast.error("Please fix the validation errors");
        return;
      }

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ section, data: validationResult.data }),
      });

      if (!response.ok) {
        const error = await response.json();

        if (error.errors) {
          // Handle server-side validation errors
          const serverErrors = error.errors.map(
            (err: { path?: string[]; message: string }) => ({
              field: err.path?.join(".") || "unknown",
              message: err.message,
            }),
          );
          setValidationErrors(serverErrors);
          options.onValidationError?.(serverErrors);
          throw new Error(
            "Validation failed: " +
              serverErrors
                .map((e: { message: string }) => e.message)
                .join(", "),
          );
        }

        // Handle other types of errors
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        } else if (response.status === 404) {
          throw new Error("Resume not found.");
        } else {
          throw new Error(error.message || "Failed to save resume data");
        }
      }

      toast.success("Changes saved successfully");
      options.onSuccess?.();
    } catch (error) {
      console.error("Error saving resume data:", error);

      if (error instanceof Error) {
        toast.error(error.message);
        options.onError?.(error);
      } else {
        const genericError = new Error("Failed to save changes");
        toast.error(genericError.message);
        options.onError?.(genericError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const clearValidationErrors = () => {
    setValidationErrors([]);
  };

  return {
    isSaving,
    validationErrors,
    saveSection,
    clearValidationErrors,
  };
}
