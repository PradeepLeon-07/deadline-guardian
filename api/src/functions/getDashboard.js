import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";

app.http("getDashboard", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "dashboard",
  handler: async () => {
    try {
      const client = await getTableClient();
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      let total = 0, pending = 0, completed = 0, overdue = 0, dueSoon = 0;

      for await (const entity of client.listEntities()) {
        total++;
        const due = new Date(entity.DueDateTimeUtc);
        if (entity.Status === "Completed") {
          completed++;
        } else if (due < now) {
          overdue++;
          pending++;
        } else {
          pending++;
          if (due <= in24h) dueSoon++;
        }
      }

      return { status: 200, jsonBody: { total, pending, completed, overdue, dueSoon } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  },
});
