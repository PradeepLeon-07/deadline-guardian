import { app } from "@azure/functions";
import { getTableClient } from "../lib/tableClient.js";

app.http("deleteDeadline", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "deadlines/{id}",
  handler: async (request) => {
    const id = request.params.id;
    const client = await getTableClient();

    try {
      await client.deleteEntity("deadline", id);
      return { status: 200, jsonBody: { message: "Deleted successfully." } };
    } catch {
      return { status: 404, jsonBody: { error: "Deadline not found." } };
    }
  },
});
