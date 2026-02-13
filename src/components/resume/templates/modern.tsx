import { type ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

interface ModernResumeProps {
  data: ResumeData;
  className?: string;
}

export function ModernResume({ data, className }: ModernResumeProps) {
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
        <h1 className="mb-2 text-3xl font-bold text-[#2563eb]">
          {data.personalInfo.name}
        </h1>
        <p className="mb-4 text-lg text-[#2563eb]/80">
          {data.personalInfo.title}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href={`mailto:${data.personalInfo.email}`}
            className="text-[#2563eb] hover:underline"
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
              className="text-[#2563eb] hover:underline"
            >
              LinkedIn
            </a>
          )}
          {data.personalInfo.github && (
            <a
              href={`https://github.com/${data.personalInfo.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563eb] hover:underline"
            >
              GitHub
            </a>
          )}
          {data.personalInfo.website && (
            <a
              href={data.personalInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563eb] hover:underline"
            >
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-[#2563eb] text-xl font-semibold text-[#2563eb]">
            Summary
          </h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-[#2563eb] text-xl font-semibold text-[#2563eb]">
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{exp.company}</h3>
                    <p className="text-gray-700">{exp.position}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-600">{exp.location}</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
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
          <h2 className="mb-3 border-b-2 border-[#2563eb] text-xl font-semibold text-[#2563eb]">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{edu.school}</h3>
                    <p className="text-gray-700">{edu.degree}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-600">{edu.location}</p>
                {edu.description && (
                  <ul className="list-inside list-disc space-y-1 text-sm">
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
          <h2 className="mb-3 border-b-2 border-[#2563eb] text-xl font-semibold text-[#2563eb]">
            Skills
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded bg-blue-50 px-2 py-1 text-sm text-[#2563eb]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft && data.skills.soft.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded bg-blue-50 px-2 py-1 text-sm text-[#2563eb]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.languages && data.skills.languages.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="rounded bg-blue-50 px-2 py-1 text-sm text-[#2563eb]"
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
          <h2 className="mb-3 border-b-2 border-[#2563eb] text-xl font-semibold text-[#2563eb]">
            Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="font-medium">{project.name}</h3>
                <p className="mb-2 text-sm text-gray-600">
                  {project.technologies}
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
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
          <h2 className="mb-3 border-b-2 border-[#2563eb] text-xl font-semibold text-[#2563eb]">
            Certifications
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{cert.name}</h3>
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
          <h2 className="mb-3 border-b-2 border-[#2563eb] text-xl font-semibold text-[#2563eb]">
            Achievements
          </h2>
          <div className="space-y-2">
            {data.achievements.map((achievement, index) => (
              <div key={index}>
                <h3 className="font-medium">{achievement.title}</h3>
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
