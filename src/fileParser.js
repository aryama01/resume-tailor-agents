const XLSX = require("xlsx");
const fs = require("fs");
const mammoth = require("mammoth");
const path = require("path");

/**
 * Reads the Excel file and returns an array of job link rows.
 * Each row has: id (#), url, and any other columns present.
 */
function readJobLinks(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  return rows;
}

/**
 * Reads option2_jobs.json and returns an array of job objects.
 */
function readJobsJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  // ✅ ensure we return an array
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.jobs)) return data.jobs;

  throw new Error("Invalid jobs JSON format: expected an array");
}

/**
 * Joins Excel rows with JSON job objects on their shared ID field.
 * Uses String() comparison to handle numeric vs string type mismatch.
 */
function mergeJobData(links, jobs) {
  return jobs.map((job) => {
    const linkRow = links.find((r) => String(r["#"]) === String(job.id));
    return {
      ...job,
      url: linkRow ? linkRow["URL"] : null,
    };
  });
}

/**
 * Extracts plain text from a .docx resume file using mammoth.
 */
async function readResume(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  if (!result.value || result.value.trim() === "") {
    throw new Error(`Resume text is empty. Check the file at: ${filePath}`);
  }
  return result.value;
}

module.exports = { readJobLinks, readJobsJson, mergeJobData, readResume };