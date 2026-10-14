import Link from "next/link";
import { Card } from "@/components/ui/card";

// Dummy roles for demonstration
const dummyRoles = [
  { id: "role-1", title: "Software Engineer", duration: "45 min" },
  { id: "role-2", title: "Product Manager", duration: "30 min" },
  { id: "role-3", title: "Data Scientist", duration: "60 min" },
  { id: "role-4", title: "UX Designer", duration: "45 min" },
];

export default function InterviewTypePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Select Role</h2>
        <p className="text-muted-foreground">Choose a role to practice for</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {dummyRoles.map((role) => (
          <Link key={role.id} href={`/interview-preparation/any/${role.id}`}>
            <Card className="p-6 hover:bg-muted/50">
              <h3 className="font-semibold">{role.title}</h3>
              <p className="text-sm text-muted-foreground">
                Duration: {role.duration}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
