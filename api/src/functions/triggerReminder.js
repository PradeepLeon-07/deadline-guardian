import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";
import { sendReminderEmail } from "../lib/emailService.js";

app.http("triggerReminder", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "test/trigger-reminder",
  handler: async () => {
    try {
      const client = await getTableClient();
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in1h = new Date(now.getTime() + 60 * 60 * 1000);
      const results = [];

      for await (const entity of client.listEntities()) {
        if (entity.Status === "Completed") continue;
        const due = new Date(entity.DueDateTimeUtc);
        if (due < now) continue;

        // For test endpoint: always attempt if due within 24h regardless of flags
        const withinWindow = due <= in24h;
        if (!withinWindow) continue;

        const hoursLeft = (due - now) / (1000 * 60 * 60);

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
        results.push({ title: entity.Title, email: entity.StudentEmail });
      }

      return {
        status: 200,
        jsonBody: {
          message: results.length ? `Sent ${results.length} reminder(s).` : "No reminders needed right now.",
          reminders: results,
        },
      };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
