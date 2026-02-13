import { Text, View, StyleSheet, Page } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    color: "#000000",
    opacity: 0.8,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 10,
    color: "#000000",
  },
  section: {
    marginBottom: 15,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    paddingBottom: 4,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  itemDate: {
    fontSize: 10,
    color: "#333333",
  },
  itemSubtitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 4,
    color: "#000000",
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 4,
    color: "#000000",
  },
  technologies: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  tech: {
    fontSize: 9,
    color: "#333333",
    marginTop: 4,
  },
  link: {
    fontSize: 10,
    color: "#000000",
    textDecoration: "underline",
    marginTop: 2,
  },
  bullet: {
    fontSize: 10,
    color: "#000000",
    marginHorizontal: 4,
  },
});

interface ModernPDFTemplateProps {
  data: {
    personalInfo: {
      fullName: string;
      jobTitle: string;
      email: string;
      phone: string;
      location: string;
    };
    experiences: Array<{
      companyName: string;
      jobTitle: string;
      startDate: string;
      endDate: string;
      description: string;
      technologies: string[];
    }>;
    education: Array<{
      school: string;
      degree: string;
      fieldOfStudy: string;
      startDate: string;
      endDate: string;
      gpa?: string;
      achievements?: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      startDate?: string;
      endDate?: string;
      url?: string;
    }>;
    certifications: Array<{
      name: string;
      issuingOrg: string;
      issueDate: string;
      expiryDate?: string;
      credentialId?: string;
      credentialUrl?: string;
    }>;
    achievements: Array<{
      title?: string;
      date?: string;
      description?: string;
    }>;
    skills: {
      technical: string[];
      soft: string[];
      tools: string[];
    };
    summary?: {
      content: string;
    };
  };
}

export function ModernPDFTemplate({ data }: ModernPDFTemplateProps) {
  // Helper function to check if a section has content
  const hasContent = (arr: any[] | undefined) =>
    Array.isArray(arr) && arr.length > 0;

  return (
    <Page size="A4" style={styles.page}>
      {/* Header - Always render as it's required */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.fullName}</Text>
        <Text style={styles.jobTitle}>{data.personalInfo.jobTitle}</Text>
        <View style={styles.contactInfo}>
          <Text>{data.personalInfo.email}</Text>
          <Text style={styles.bullet}>•</Text>
          <Text>{data.personalInfo.phone}</Text>
          <Text style={styles.bullet}>•</Text>
          <Text>{data.personalInfo.location}</Text>
        </View>
      </View>

      {/* Summary - Optional */}
      {data.summary?.content && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.text}>{data.summary.content}</Text>
        </View>
      )}

      {/* Experience */}
      {hasContent(data.experiences) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experiences.map((exp, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{exp.companyName}</Text>
                <Text style={styles.itemDate}>
                  {exp.startDate} - {exp.endDate}
                </Text>
              </View>
              <Text style={styles.itemSubtitle}>{exp.jobTitle}</Text>
              <Text style={styles.text}>{exp.description}</Text>
              {hasContent(exp.technologies) && (
                <Text style={styles.tech}>{exp.technologies.join(" • ")}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {hasContent(data.education) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{edu.school}</Text>
                <Text style={styles.itemDate}>
                  {edu.startDate} - {edu.endDate}
                </Text>
              </View>
              <Text style={styles.itemSubtitle}>
                {edu.degree} in {edu.fieldOfStudy}
              </Text>
              {edu.gpa && <Text style={styles.text}>GPA: {edu.gpa}</Text>}
              {edu.achievements && (
                <Text style={styles.text}>{edu.achievements}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {hasContent(data.skills.technical) && (
            <Text style={styles.text}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Technical: </Text>
              {data.skills.technical.join(" • ")}
            </Text>
          )}
          {hasContent(data.skills.soft) && (
            <Text style={styles.text}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                Soft Skills:{" "}
              </Text>
              {data.skills.soft.join(" • ")}
            </Text>
          )}
          {hasContent(data.skills.tools) && (
            <Text style={styles.text}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Tools: </Text>
              {data.skills.tools.join(" • ")}
            </Text>
          )}
        </View>
      )}

      {/* Projects */}
      {hasContent(data.projects) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((project, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{project.name}</Text>
              </View>
              <Text style={styles.text}>{project.description}</Text>
              {hasContent(project.technologies) && (
                <Text style={styles.tech}>
                  {project.technologies.join(" • ")}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {hasContent(data.certifications) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {data.certifications.map((cert, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{cert.name}</Text>
                <Text style={styles.itemDate}>{cert.issueDate}</Text>
              </View>
              <Text style={styles.itemSubtitle}>{cert.issuingOrg}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Achievements */}
      {hasContent(data.achievements) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {data.achievements.map((achievement, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              {achievement.title && (
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{achievement.title}</Text>
                  {achievement.date && (
                    <Text style={styles.itemDate}>{achievement.date}</Text>
                  )}
                </View>
              )}
              {achievement.description && (
                <Text style={styles.text}>{achievement.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}
