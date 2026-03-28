# Resume Tailor Agent

An AI-powered agent that reads a candidate's resume and 5 job descriptions, tailors the resume for each role using the Gemini API, saves each version as a `.docx` file, and emails it as an attachment.

---

## Option Chosen

**Option 2 – AI Resume Tailoring Agent**

Chosen because it showcases an end-to-end AI pipeline with real prompt engineering. The LLM API was more approachable than learning browser automation from scratch within the time constraint.

---

## Tech Stack

| Concern | Library |
|---|---|
| Runtime | Node.js |
| LLM | Google Gemini 1.5 Flash (free tier) |
| Excel parsing | xlsx |
| Resume reading | mammoth |
| Document generation | docx |
| Email delivery | nodemailer (Gmail SMTP) |
| Env management | dotenv |

---

## Project Structure

```
resume-tailor-agent/
├── src/
│   ├── index.js          ← Main entry point, orchestrates everything
│   ├── fileParser.js     ← Reads Excel, JSON, and .docx inputs
│   ├── llmClient.js      ← Gemini API calls and prompt logic
│   ├── docGenerator.js   ← Saves tailored resume as .docx
│   └── emailer.js        ← Sends email with attachment via Gmail
├── inputs/
│   ├── option2_job_links.xlsx
│   ├── option2_jobs.json
│   └── candidate_resume.docx
├── outputs/              ← Generated resumes saved here (git-ignored)
├── .env                  ← Real secrets, never committed
├── .env.example          ← Placeholder keys for reference
├── .gitignore
├── package.json
└── README.md
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/resume-tailor-agent.git
cd resume-tailor-agent
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all four values (see details below).

### 3. Get a Gemini API key (free)

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Paste it into `.env` as `GEMINI_API_KEY`

### 4. Set up Gmail App Password

1. Make sure your Gmail account has **2-Step Verification** enabled
2. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Paste the 16-character password into `.env` as `EMAIL_APP_PASSWORD`
5. Set `EMAIL_USER` to your Gmail address
6. Set `EMAIL_TO` to whoever should receive the emails (can be yourself)

### 5. Place input files

Put the following files in the `inputs/` folder:

- `option2_job_links.xlsx`
- `option2_jobs.json`
- `candidate_resume.docx`

---

## Running

```bash
node src/index.js
# or
npm start
```

Expected output:

```
=== Resume Tailor Agent Starting ===

Loaded 5 jobs. Starting processing...

--- Processing: Backend Engineer at Acme Corp ---
  [1/3] Calling Gemini API...
  [2/3] Generating document...
  [docGenerator] Saved: outputs/resume_backend_engineer_acme_corp.docx
  [3/3] Sending email...
  [emailer] Email sent for: Backend Engineer at Acme Corp
  ✓ Done

...

=== Run Complete ===
✓ Succeeded (5): Backend Engineer, ...
✗ Failed: none
```

Tailored `.docx` files are saved to `outputs/`. One email per job is sent to `EMAIL_TO`.

---

## Approach & Key Decisions

### Modular structure
Each concern lives in its own file — parsing, LLM, doc generation, and email are all separate modules. `index.js` only orchestrates them. This makes each piece independently testable and easy to follow.

### Per-job error handling
Every job is wrapped in its own `try/catch` block inside the loop. One Gemini API failure or one email bounce will never stop the rest of the jobs from processing. A final summary prints which jobs succeeded and which failed with their error messages.

### Prompt design
The prompt instructs the LLM to: rewrite the summary using the job's language, reorder the skills section by relevance, rephrase experience bullets with keywords from the job description, and adjust section order based on role type. This ensures each of the 5 outputs is meaningfully distinct, not just a header swap.

### Rate limiting
A 2-second delay is added between Gemini API calls to respect the free tier's per-minute request limit.

### Filename convention
Files are named `resume_{title}_{company}.docx` (slugified) so they are human-readable and unique.

---

## Assumptions

- The evaluator has a Gmail account with 2FA enabled, or can substitute their own SMTP credentials in `emailer.js`
- The `#` column in the Excel file corresponds to the `id` field in the JSON (joined as strings to handle type mismatch)
- Input files are placed in the `inputs/` directory before running
- The `outputs/` directory is created automatically on first run

---

## What I'd Improve With More Time

- **PDF output**: Add an option to generate `.pdf` alongside `.docx` using LibreOffice headless or a conversion library
- **Retry logic**: Add exponential backoff for transient Gemini API failures instead of failing the whole job immediately
- **Better email template**: Replace plain text email body with an HTML template
- **CLI flags**: Allow passing `--job-id` to reprocess a single job without rerunning all 5
- **Unit tests**: Add tests for `fileParser.js` and `docGenerator.js` with fixture data

---

## Demo Video

[Paste your Loom / YouTube / Google Drive link here]