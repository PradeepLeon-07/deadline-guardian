import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";
import { sendReminderEmail } from "../lib/emailService.js";

app.http("sendDeadlineReminder", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "deadlines/{id}/remind",
  handler: async (request) => {
    try {
      const client = await getTableClient();
      let entity;
      try {
        entity = await client.getEntity("deadline", request.params.id);
      } catch (error) {
        if (error.statusCode === 404) {
          return { status: 404, jsonBody: { error: "Deadline not found." } };
        }
        throw error;
      }

      const hoursLeft =
        (new Date(entity.DueDateTimeUtc).getTime() - Date.now()) /
        (60 * 60 * 1000);

      await sendReminderEmail({
        to: entity.StudentEmail,
        title: entity.Title,
        subject: entity.Subject,
        dueDateTime: entity.DueDateTimeUtc,
        hoursLeft,
      });

      const now = new Date();
      const due = new Date(entity.DueDateTimeUtc);
      if (due >= now) {
        await client.updateEntity(
          {
            partitionKey: entity.partitionKey,
            rowKey: entity.rowKey,
            ...(hoursLeft <= 24 && { Reminder24HoursSent: true }),
            ...(hoursLeft <= 1 && { Reminder1HourSent: true }),
          },
          "Merge"
        );
      }

      return {
        status: 200,
        jsonBody: { message: `Reminder sent for "${entity.Title}".` },
      };
    } catch (error) {
      return { status: 500, jsonBody: { error: error.message } };
    }
  },
});
