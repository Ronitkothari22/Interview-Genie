export function QuestionPanel() {
  return (
    <div className="border-l p-4">
      <h1 className="mb-4 text-xl font-bold">Interview Questions</h1>
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Current Question</h2>
          <p className="mt-2 text-muted-foreground">
            Tell me about a challenging project you&apos;ve worked on.
          </p>
          <p className="text-muted-foreground">
            We&apos;ll analyze your response and provide feedback
          </p>
        </div>
      </div>
    </div>
  );
}
