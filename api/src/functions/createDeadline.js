import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";
import { randomUUID } from "crypto";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(value) {
  return value.split(",").map((e) => e.trim()).filter(Boolean);
}

app.http("createDeadline", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "deadlines",
  handler: async (request) => {
    try {
      const body = await request.json();
      const { title, subject, description, dueDateTime, priority, studentEmail } = body;

      if (!title || !subject || !dueDateTime || !priority || !studentEmail) {
        return { status: 400, jsonBody: { error: "title, subject, dueDateTime, priority, and studentEmail are required." } };
      }

      const emails = parseEmails(studentEmail);
      if (emails.length === 0) {
        return { status: 400, jsonBody: { error: "At least one email address is required." } };
      }
      const invalidEmail = emails.find((e) => !emailRegex.test(e));
      if (invalidEmail) {
        return { status: 400, jsonBody: { error: `Invalid email address: ${invalidEmail}` } };
      }

      const due = new Date(dueDateTime);
      if (isNaN(due.getTime())) {
        return { status: 400, jsonBody: { error: "Invalid dueDateTime format." } };
      }

      if (!["Low", "Medium", "High"].includes(priority)) {
        return { status: 400, jsonBody: { error: "Priority must be Low, Medium, or High." } };
      }

      const id = randomUUID();
      const entity = {
        partitionKey: "deadline",
        rowKey: id,
        Title: title,
        Subject: subject,
        Description: description || "",
        DueDateTimeUtc: due.toISOString(),
        Priority: priority,
        StudentEmail: emails.join(","), // store as comma-separated string
        Status: "Pending",
        Reminder24HoursSent: false,
        Reminder1HourSent: false,
        CreatedAtUtc: new Date().toISOString(),
      };

      const client = await getTableClient();
      await client.createEntity(entity);

      return { status: 201, jsonBody: { ...entity, id } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
