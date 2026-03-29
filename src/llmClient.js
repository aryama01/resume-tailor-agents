const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function tailorResume(resumeText, job) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
You are an expert resume writer specializing in ATS-optimized, role-specific resumes.

Your task is to deeply tailor the candidate's resume for the given job role. Each output must feel uniquely crafted for this specific position, even if multiple roles belong to the same company.

=====================
JOB CONTEXT
=====================
Job Title: ${job.title}
Company: ${job.company}

Job Description:
${job.description}

=====================
CANDIDATE RESUME
=====================
${resumeText}

=====================
INSTRUCTIONS
=====================

1. ROLE ALIGNMENT
- Identify the primary focus of this role (e.g., backend, frontend, ML, DevOps).
- Emphasize only the most relevant skills and experiences for THIS role.
- De-emphasize or remove less relevant content.

2. KEYWORD OPTIMIZATION (VERY IMPORTANT)
- Extract important keywords, tools, and technologies from the job description.
- Naturally incorporate them into the resume.
- Ensure the resume is ATS-friendly.

3. CONTENT REWRITING
- Rewrite the professional summary (3-4 sentences) to align with the role.
- Each experience role must have 4-6 detailed bullet points minimum.
- Every bullet point must follow this structure:
  [Strong action verb] + [what you did] + [how you did it] + [measurable result]
  Example: "Engineered a RESTful microservice using FastAPI and PostgreSQL, reducing API response time by 45% for 10,000 daily users"
- Include specific technologies, tools, and metrics in every bullet.
- Never write vague bullets like "Worked on backend systems" — always be specific.
- Quantify everything possible: percentages, user counts, time saved, requests/second.

4. SECTION PRIORITIZATION
- Reorder sections based on role importance:
  - Backend: Projects + APIs + Databases first
  - Frontend: UI/UX + frameworks first
  - ML: Models + data + experimentation first
  - DevOps: CI/CD + cloud + infra first
- Skills section should be reordered based on relevance.

5. DIFFERENTIATION (CRITICAL)
- This resume MUST look noticeably different from other role versions.
- Change:
  - Summary tone and focus
  - Skill ordering
  - Bullet point emphasis
  - Section ordering

6. FORMATTING (CRITICAL)
- Output PLAIN TEXT ONLY. No markdown whatsoever.
- Do NOT use asterisks (* or **) for anything.
- Do NOT use # symbols, backticks, or underscores for formatting.
- Section headers must be written in ALL CAPS on their own line.
- Bullet points must start with a hyphen and space: "- bullet text"
- Clean professional structure:
  SUMMARY
  SKILLS
  EXPERIENCE
  PROJECTS (if applicable)
  EDUCATION
- Do NOT include explanations, preamble, or extra text.

=====================
OUTPUT FORMAT
=====================
Return ONLY the final tailored resume.
No explanations. No "Here is your resume". Plain text only. No asterisks.
`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();

  if (!text || text.trim() === "") {
    throw new Error("Gemini returned an empty response.");
  }

  // Safety net: strip any markdown that slips through
  text = text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1");

  return text;
}

module.exports = { tailorResume };