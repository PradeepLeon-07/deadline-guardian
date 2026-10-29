import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";

app.http("updateDeadline", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "deadlines/{id}",
  handler: async (request) => {
    const id = request.params.id;
    const body = await request.json();
    const client = await getTableClient();

    let existing;
    try {
      existing = await client.getEntity("deadline", id);
    } catch {
      return { status: 404, jsonBody: { error: "Deadline not found." } };
    }

    const { title, subject, description, dueDateTime, priority, studentEmail } = body;

    if (dueDateTime && isNaN(new Date(dueDateTime).getTime())) {
      return { status: 400, jsonBody: { error: "Invalid dueDateTime format." } };
    }

    if (priority && !["Low", "Medium", "High"].includes(priority)) {
      return { status: 400, jsonBody: { error: "Priority must be Low, Medium, or High." } };
    }

    const updated = {
      partitionKey: "deadline",
      rowKey: id,
      Title: title ?? existing.Title,
      Subject: subject ?? existing.Subject,
      Description: description ?? existing.Description,
      DueDateTimeUtc: dueDateTime ? new Date(dueDateTime).toISOString() : existing.DueDateTimeUtc,
      Priority: priority ?? existing.Priority,
      StudentEmail: studentEmail ?? existing.StudentEmail,
      Status: existing.Status,
      Reminder24HoursSent: existing.Reminder24HoursSent,
      Reminder1HourSent: existing.Reminder1HourSent,
      CreatedAtUtc: existing.CreatedAtUtc,
    };

    await client.updateEntity(updated, "Replace");
    return { status: 200, jsonBody: updated };
  },
});
