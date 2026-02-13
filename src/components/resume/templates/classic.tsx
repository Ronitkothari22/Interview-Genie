import { type ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

interface ClassicResumeProps {
  data: ResumeData;
  className?: string;
}

export function ClassicResume({ data, className }: ClassicResumeProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[210mm] bg-white text-black",
        "p-8 shadow-lg dark:ring-1 dark:ring-white/10 print:shadow-none",
        className,
      )}
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {data.personalInfo.name}
        </h1>
        <p className="mb-4 text-lg text-gray-700">{data.personalInfo.title}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <a
            href={`mailto:${data.personalInfo.email}`}
            className="hover:text-primary"
          >
            {data.personalInfo.email}
          </a>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <a
              href={`https://linkedin.com/in/${data.personalInfo.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              LinkedIn
            </a>
          )}
          {data.personalInfo.github && (
            <a
              href={`https://github.com/${data.personalInfo.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              GitHub
            </a>
          )}
          {data.personalInfo.website && (
            <a
              href={data.personalInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-200 text-xl font-semibold text-gray-900">
            Summary
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            {data.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-200 text-xl font-semibold text-gray-900">
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{exp.company}</h3>
                    <p className="text-gray-700">{exp.position}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-600">{exp.location}</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-200 text-xl font-semibold text-gray-900">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{edu.school}</h3>
                    <p className="text-gray-700">{edu.degree}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-600">{edu.location}</p>
                {edu.description && (
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {edu.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-200 text-xl font-semibold text-gray-900">
            Skills
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft && data.skills.soft.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.languages && data.skills.languages.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-200 text-xl font-semibold text-gray-900">
            Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                <p className="mb-2 text-sm text-gray-600">
                  {project.technologies}
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                  {project.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-200 text-xl font-semibold text-gray-900">
            Certifications
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                </div>
                <div className="text-sm text-gray-600">{cert.date}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-200 text-xl font-semibold text-gray-900">
            Achievements
          </h2>
          <div className="space-y-2">
            {data.achievements.map((achievement, index) => (
              <div key={index}>
                <h3 className="font-medium text-gray-900">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
