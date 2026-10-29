import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";

app.http("getDeadlineById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "deadlines/{id}",
  handler: async (request) => {
    const id = request.params.id;
    const client = await getTableClient();

    try {
      const entity = await client.getEntity("deadline", id);
      return { status: 200, jsonBody: entity };
    } catch {
      return { status: 404, jsonBody: { error: "Deadline not found." } };
    }
  },
});
