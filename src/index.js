require("dotenv").config();
const path = require("path");

const { readJobLinks, readJobsJson, mergeJobData, readResume } = require("./fileParser");
const { tailorResume } = require("./llmClient");
const { saveAsDocx, makeFilename } = require("./docGenerator");
const { sendEmail } = require("./emailer");

const INPUTS = path.join(__dirname, "../inputs");

async function main() {
  console.log("Resume Tailor Agent Starting ...\n");

  //Load all inputs 
  let links, jobs, mergedJobs, resumeText;

  try {
    links = readJobLinks(path.join(INPUTS, "option2_job_links.xlsx"));
    jobs = readJobsJson(path.join(INPUTS, "option2_jobs.json"));
    mergedJobs = mergeJobData(links, jobs);
    resumeText = await readResume(path.join(INPUTS, "candidate_resume.docx"));
    console.log("Jobs type:", typeof jobs);
    console.log("Is jobs array:", Array.isArray(jobs));
    console.log("Jobs preview:", jobs);
  } catch (err) {
    console.error("Fatal: Could not load input files.");
    console.error(err.message);
    process.exit(1);
  }

  console.log(`Loaded ${mergedJobs.length} jobs. Starting processing...\n`);

  const results = { success: [], failed: [] };

  // Process each job independently 
  for (const job of mergedJobs) {
    console.log(` Processing: ${job.title} at ${job.company}`);

    try {
      console.log(`Calling Gemini API`);
      const tailoredText = await tailorResume(resumeText, job);

      await new Promise((res) => setTimeout(res, 10000));

      console.log(`Generating document`);
      const filename = makeFilename(job);
      const filePath = await saveAsDocx(tailoredText, filename);

      console.log(`Sending email`);
      await sendEmail(job, filePath);

      results.success.push(job.title);
      console.log(`  ✓ Done\n`);

    } catch (err) {
      // One job failing NEVER stops the rest
      results.failed.push({ title: job.title, error: err.message });
      console.error(`  ✗ Failed: ${err.message}\n`);
    }
  }

  // ── Final summary ────────────────────────────────────────────────────────
  console.log("=== Run Complete ===");
  console.log(`✓ Succeeded (${results.success.length}): ${results.success.join(", ") || "none"}`);

  if (results.failed.length > 0) {
    console.log(`✗ Failed (${results.failed.length}):`);
    results.failed.forEach((f) => console.log(`  - ${f.title}: ${f.error}`));
  } else {
    console.log("✗ Failed: none");
  }
}

main().catch((err) => {
  console.error("Unexpected fatal error:", err);
  process.exit(1);
});