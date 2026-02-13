import { type ResumeData, type TemplateType } from "../types/resume";

export async function generateResumePDF(
  data: ResumeData,
  template: TemplateType,
): Promise<void> {
  // Create a temporary iframe to render the resume
  const iframe = document.createElement("iframe");
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.position = "fixed";
  iframe.style.right = "-9999px";
  document.body.appendChild(iframe);

  // Wait for iframe to load
  await new Promise((resolve) => {
    iframe.onload = resolve;
  });

  try {
    // Get the iframe document
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) throw new Error("Could not access iframe document");

    // Add required styles
    const style = iframeDoc.createElement("style");
    style.textContent = `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    iframeDoc.head.appendChild(style);

    // Create a container for the resume
    const container = iframeDoc.createElement("div");
    container.id = "resume-container";
    iframeDoc.body.appendChild(container);

    // Import React and ReactDOM dynamically
    const React = await import("react");
    const ReactDOM = await import("react-dom/client");

    // Import the appropriate template component
    const { ModernResume } = await import(
      "@/components/resume/templates/modern"
    );
    const { ClassicResume } = await import(
      "@/components/resume/templates/classic"
    );
    const { MinimalistResume } = await import(
      "@/components/resume/templates/minimalist"
    );

    // Create a root for React rendering
    const root = ReactDOM.createRoot(container);

    // Render the appropriate template
    const TemplateComponent = {
      modern: ModernResume,
      classic: ClassicResume,
      minimalist: MinimalistResume,
    }[template];

    root.render(React.createElement(TemplateComponent, { data }));

    // Wait for any images to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Print the iframe content
    iframe.contentWindow?.print();
  } finally {
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000); // Give enough time for the print dialog to appear
  }
}
