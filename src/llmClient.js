const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function tailorResume(resumeText, job) {
  const prompt = `
You are an expert resume writer specializing in ATS-optimized, role-specific resumes.

Your task is to deeply tailor the candidate’s resume for the given job role. Each output must feel uniquely crafted for this specific position, even if multiple roles belong to the same company.

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
- Rewrite the professional summary to align with the role.
- Rewrite experience bullet points to highlight relevant impact.
- Use action verbs and quantify achievements where possible.
- Make bullet points concise and impactful.

4. SECTION PRIORITIZATION
- Reorder sections based on role importance:
  - Backend → Projects + APIs + Databases first
  - Frontend → UI/UX + frameworks first
  - ML → Models + data + experimentation first
  - DevOps → CI/CD + cloud + infra first
- Skills section should be reordered based on relevance.

5. DIFFERENTIATION (CRITICAL)
- This resume MUST look noticeably different from other role versions.
- Change:
  - Summary tone and focus
  - Skill ordering
  - Bullet point emphasis
  - Section ordering

6. FORMATTING
- Keep a clean, professional structure:
  - Summary
  - Skills
  - Experience
  - Projects (if applicable)
  - Education
- Use bullet points for experience.
- Do NOT include explanations or extra text.

=====================
OUTPUT FORMAT
=====================
Return ONLY the final tailored resume.
No explanations. No headings like "Here is your resume".
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", 
    messages: [
      { role: "user", content: prompt }
    ],
  });

  return response.choices[0].message.content;
}

module.exports = { tailorResume };