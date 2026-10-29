import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";

app.http("completeDeadline", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "deadlines/{id}/complete",
  handler: async (request) => {
    const id = request.params.id;
    const client = await getTableClient();

    let existing;
    try {
      existing = await client.getEntity("deadline", id);
    } catch {
      return { status: 404, jsonBody: { error: "Deadline not found." } };
    }

    const updated = { ...existing, Status: "Completed" };
    await client.updateEntity(updated, "Replace");
    return { status: 200, jsonBody: updated };
  },
});
