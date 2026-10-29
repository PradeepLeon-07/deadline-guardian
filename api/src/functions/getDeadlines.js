import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";

app.http("getDeadlines", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "deadlines",
  handler: async (request) => {
    try {
      const { status, subject } = Object.fromEntries(request.query);
      const client = await getTableClient();
      const entities = [];

      for await (const entity of client.listEntities()) {
        entities.push(entity);
      }

      const filtered = entities.filter((e) => {
        if (status && e.Status !== status) return false;
        if (subject && !e.Subject?.toLowerCase().includes(subject.toLowerCase())) return false;
        return true;
      });

      filtered.sort((a, b) => new Date(a.DueDateTimeUtc) - new Date(b.DueDateTimeUtc));

      return { status: 200, jsonBody: filtered };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
