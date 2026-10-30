import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendReminderEmail({ to, title, subject, dueDateTime, hoursLeft }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      "Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in the Azure app settings."
    );
  }

  const dueLabel =
    hoursLeft < 0
      ? `overdue by ${Math.ceil(Math.abs(hoursLeft))} hour(s)`
      : hoursLeft <= 1
        ? "due within 1 hour"
        : hoursLeft <= 24
          ? "due within 24 hours"
          : `due in ${Math.ceil(hoursLeft / 24)} day(s)`;
  const recipients = to.split(",").map((e) => e.trim()).filter(Boolean);

  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
      <h2 style="color:#dc2626">⏰ Deadline Reminder</h2>
      <p>Your assignment is <strong>${dueLabel}</strong>.</p>
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
    subject: `⏰ Reminder: "${title}" — ${dueLabel}`,
    html,
  });

  console.log(`[Email] Sent to ${recipients.join(", ")} — MessageId: ${info.messageId}`);
  return { success: true, id: info.messageId };
}

export { sendReminderEmail };
