import { type ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

interface MinimalistResumeProps {
  data: ResumeData;
  className?: string;
}

export function MinimalistResume({ data, className }: MinimalistResumeProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[210mm] bg-white font-sans text-zinc-900",
        "p-8 shadow-lg print:shadow-none",
        className,
      )}
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-light">{data.personalInfo.name}</h1>
        <div className="space-x-4 text-sm text-zinc-600">
          <a
            href={`mailto:${data.personalInfo.email}`}
            className="hover:text-black"
          >
            {data.personalInfo.email}
          </a>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
        </div>
        <div className="mt-1 space-x-4 text-sm text-zinc-600">
          <a
            href={`https://linkedin.com/in/${data.personalInfo.linkedin}`}
            className="hover:text-black"
          >
            LinkedIn
          </a>
          <a
            href={`https://github.com/${data.personalInfo.github}`}
            className="hover:text-black"
          >
            GitHub
          </a>
          {data.personalInfo.website && (
            <a href={data.personalInfo.website} className="hover:text-black">
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-zinc-900">
          About
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600">{data.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-900">
          Experience
        </h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-6">
            <div className="mb-1 grid grid-cols-[1fr_auto] gap-4">
              <h3 className="font-medium">{exp.company}</h3>
              <span className="text-sm text-zinc-500">
                {exp.startDate} - {exp.endDate}
              </span>
            </div>
            <div className="mb-2 grid grid-cols-[1fr_auto] gap-4">
              <p className="text-sm text-zinc-600">{exp.position}</p>
              <p className="text-sm text-zinc-500">{exp.location}</p>
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-900">
          Education
        </h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-6">
            <div className="mb-1 grid grid-cols-[1fr_auto] gap-4">
              <h3 className="font-medium">{edu.school}</h3>
              <span className="text-sm text-zinc-500">
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
            <div className="mb-2 grid grid-cols-[1fr_auto] gap-4">
              <p className="text-sm text-zinc-600">{edu.degree}</p>
              <p className="text-sm text-zinc-500">{edu.location}</p>
            </div>
            {edu.description && (
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
                {edu.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-900">
          Projects
        </h2>
        {data.projects.map((project, index) => (
          <div key={index} className="mb-6">
            <div className="mb-1 grid grid-cols-[1fr_auto] gap-4">
              <h3 className="font-medium">{project.name}</h3>
              <span className="text-sm text-zinc-500">{project.date}</span>
            </div>
            <p className="mb-2 text-sm text-zinc-600">{project.technologies}</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
              {project.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-900">
          Skills
        </h2>
        <div className="space-y-2 text-sm text-zinc-600">
          <p>
            <span className="text-zinc-900">Technical:</span>{" "}
            {data.skills.technical.join(" • ")}
          </p>
          <p>
            <span className="text-zinc-900">Soft Skills:</span>{" "}
            {data.skills.soft.join(" • ")}
          </p>
          <p>
            <span className="text-zinc-900">Languages:</span>{" "}
            {data.skills.languages.join(" • ")}
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-900">
          Certifications
        </h2>
        {data.certifications.map((cert, index) => (
          <div key={index} className="mb-4">
            <div className="mb-1 grid grid-cols-[1fr_auto] gap-4">
              <h3 className="font-medium">{cert.name}</h3>
              <span className="text-sm text-zinc-500">{cert.date}</span>
            </div>
            <p className="text-sm text-zinc-600">{cert.issuer}</p>
            {cert.description && (
              <p className="mt-1 text-sm text-zinc-600">{cert.description}</p>
            )}
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-900">
          Achievements
        </h2>
        {data.achievements.map((achievement, index) => (
          <div key={index} className="mb-4">
            <div className="mb-1 grid grid-cols-[1fr_auto] gap-4">
              <h3 className="font-medium">{achievement.title}</h3>
              <span className="text-sm text-zinc-500">{achievement.date}</span>
            </div>
            <p className="text-sm text-zinc-600">{achievement.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
