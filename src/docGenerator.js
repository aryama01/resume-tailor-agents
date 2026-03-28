const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");
const fs = require("fs");
const path = require("path");

/**
 * Converts tailored resume plain text into a .docx file.
 * Detects ALL-CAPS section headers and formats them as headings.
 */
async function saveAsDocx(resumeText, filename) {
  const lines = resumeText.split("\n").filter((l) => l.trim() !== "");

  const children = lines.map((line) => {
    const trimmed = line.trim();

    // Detect section headers: all caps, no digits, at least 3 chars
    const isHeader =
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 2 &&
      !/\d/.test(trimmed) &&
      !/[^A-Z\s\/\-]/.test(trimmed);

    if (isHeader) {
      return new Paragraph({
        text: trimmed,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      });
    }

    // Detect bullet points starting with - or •
    const isBullet = trimmed.startsWith("-") || trimmed.startsWith("•");

    return new Paragraph({
      bullet: isBullet ? { level: 0 } : undefined,
      children: [
        new TextRun({
          text: isBullet ? trimmed.replace(/^[-•]\s*/, "") : trimmed,
          size: 24,
        }),
      ],
      spacing: { after: 80 },
    });
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const outputDir = path.join(__dirname, "../outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, filename);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);

  console.log(`  [docGenerator] Saved: ${filePath}`);
  return filePath;
}

/**
 * Creates a safe filename from job title and company.
 * e.g. "Senior Backend Engineer" at "Acme Corp" → "resume_senior_backend_engineer_acme_corp.docx"
 */
function makeFilename(job) {
  const slug = `${job.title} ${job.company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `resume_${slug}.docx`;
}

module.exports = { saveAsDocx, makeFilename };