import type { Metadata } from "next";
import { InterviewQuestionsClient } from "./client";

export const metadata: Metadata = {
  title: "Interview Questions",
  description: "Practice interview questions based on job description",
};

export default function InterviewQuestionsPage() {
  return <InterviewQuestionsClient />;
}
