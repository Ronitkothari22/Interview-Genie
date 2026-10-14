import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Dummy questions for demonstration
const dummyQuestions = [
  "Tell me about yourself",
  "What are your greatest strengths?",
  "Where do you see yourself in 5 years?",
  "Why should we hire you?",
];

export default function InterviewSessionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Interview Session</h2>
        <p className="text-muted-foreground">Practice your interview skills</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Questions</h3>
          {dummyQuestions.map((question, index) => (
            <div key={index} className="rounded-lg border p-4">
              <p>{question}</p>
            </div>
          ))}
          <Button className="w-full">Start Practice</Button>
        </div>
      </Card>
    </div>
  );
}
