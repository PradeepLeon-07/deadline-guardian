import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendReminderEmail({ to, title, subject, dueDateTime, hoursLeft }) {
  const timeLabel = hoursLeft <= 1 ? "1 hour" : "24 hours";
  const recipients = to.split(",").map((e) => e.trim()).filter(Boolean);

  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
      <h2 style="color:#dc2626">⏰ Deadline Reminder</h2>
      <p>Your assignment is due in <strong>${timeLabel}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr><td style="padding:8px;color:#6b7280">Task</td><td style="padding:8px"><strong>${title}</strong></td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Subject</td><td style="padding:8px">${subject}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Due</td><td style="padding:8px">${new Date(dueDateTime).toLocaleString()}</td></tr>
      </table>
      <p style="margin-top:24px;color:#6b7280;font-size:13px">Deadline Guardian — stay on top of your work.</p>
    </div>`;

  const info = await transporter.sendMail({
    from: `"Deadline Guardian" <${process.env.GMAIL_USER}>`,
    to: recipients.join(","),
    subject: `⏰ Reminder: "${title}" due in ${timeLabel}`,
    html,
  });

  console.log(`[Email] Sent to ${recipients.join(", ")} — MessageId: ${info.messageId}`);
  return { success: true, id: info.messageId };
}

export { sendReminderEmail };
