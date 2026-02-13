import { z } from "zod";

export const jobDescriptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  description: z.string(),
  parsedData: z.object({
    requirements: z.array(z.string()),
    responsibilities: z.array(z.string()),
    skills: z.array(z.string()),
    experience: z.array(z.string()),
    education: z.array(z.string()),
  }),
  source: z.enum(["manual", "linkedin", "pdf"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JobDescription = z.infer<typeof jobDescriptionSchema>;

export async function createJobDescription(data: {
  title: string;
  company: string;
  description: string;
  source?: "manual" | "linkedin" | "pdf";
}) {
  const response = await fetch("/api/job-descriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create job description");
  }

  return jobDescriptionSchema.parse(await response.json());
}

export async function getJobDescriptions(search?: string) {
  const url = new URL("/api/job-descriptions", window.location.origin);
  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch job descriptions");
  }

  return z.array(jobDescriptionSchema).parse(await response.json());
}

export async function parseJobDescription() {
  // TODO: Implement AI-powered parsing of job description
  return {
    requirements: [],
    responsibilities: [],
    skills: [],
    experience: [],
    education: [],
  };
}
