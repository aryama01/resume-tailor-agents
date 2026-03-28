const nodemailer = require("nodemailer");

// Transporter is created once and reused across all email sends
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    // Use a Gmail App Password — NOT your regular account password.
    // Generate one at: https://myaccount.google.com/apppasswords
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Sends one email with the tailored resume attached.
 * @param {Object} job - The job object with title, company, url
 * @param {string} resumeFilePath - Absolute path to the .docx file
 */
async function sendEmail(job, resumeFilePath) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: `Tailored Resume – ${job.title} at ${job.company}`,
    text: `Hi,

Please find attached a tailored resume for the following role:

Job Title : ${job.title}
Company   : ${job.company}
Job URL   : ${job.url || "N/A"}

The resume has been customized to highlight the most relevant skills and experience for this specific position.

Best regards,
Resume Tailor Agent`,
    attachments: [
      {
        filename: resumeFilePath.split("/").pop(),
        path: resumeFilePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log(`  [emailer] Email sent for: ${job.title} at ${job.company}`);
}

module.exports = { sendEmail };