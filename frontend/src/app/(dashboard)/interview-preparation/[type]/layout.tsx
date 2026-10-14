import { notFound } from "next/navigation";

const validTypes = ["audio", "video", "technical", "behavioral"];

interface InterviewPreparationLayoutProps {
  children: React.ReactNode;
  params: {
    type: string;
  };
}

export default function InterviewPreparationLayout({
  children,
  params,
}: InterviewPreparationLayoutProps) {
  if (!validTypes.includes(params.type)) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold capitalize tracking-tight">
          {params.type} Interview Preparation
        </h2>
      </div>
      {children}
    </div>
  );
}
