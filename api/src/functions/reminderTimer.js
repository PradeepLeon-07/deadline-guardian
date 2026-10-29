import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";
import { sendReminderEmail } from "../lib/emailService.js";

app.timer("reminderTimer", {
  schedule: "0 */15 * * * *",
  handler: async () => {
    const client = await getTableClient();
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);

    for await (const entity of client.listEntities()) {
      if (entity.Status === "Completed") continue;

      const due = new Date(entity.DueDateTimeUtc);
      if (due < now) continue; // overdue — show on dashboard, no more emails

      const needs24h = due <= in24h && !entity.Reminder24HoursSent;
      const needs1h = due <= in1h && !entity.Reminder1HourSent;

      if (!needs24h && !needs1h) continue;

      const hoursLeft = (due - now) / (1000 * 60 * 60);

      try {
        await sendReminderEmail({
          to: entity.StudentEmail,
          title: entity.Title,
          subject: entity.Subject,
          dueDateTime: entity.DueDateTimeUtc,
          hoursLeft,
        });

        const patch = {
          partitionKey: entity.partitionKey,
          rowKey: entity.rowKey,
          Reminder24HoursSent: needs24h ? true : entity.Reminder24HoursSent,
          Reminder1HourSent: needs1h ? true : entity.Reminder1HourSent,
        };
        await client.updateEntity(patch, "Merge");
        console.log(`Reminder sent for: ${entity.Title}`);
      } catch (err) {
        console.error(`Failed to send reminder for ${entity.Title}:`, err.message);
      }
    }
  },
});
