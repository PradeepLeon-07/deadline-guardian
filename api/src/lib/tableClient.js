import { TableClient, TableServiceClient } from "@azure/data-tables";

const TABLE_NAME = "Deadlines";

async function getTableClient() {
  const connectionString =
    process.env.STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage;
  if (!connectionString) {
    throw new Error(
      "Missing storage connection string. Configure STORAGE_CONNECTION_STRING or AzureWebJobsStorage in the Function App settings."
    );
  }

  const serviceClient = TableServiceClient.fromConnectionString(connectionString);
  await serviceClient.createTable(TABLE_NAME).catch(() => {}); // ignore if already exists
  return TableClient.fromConnectionString(connectionString, TABLE_NAME);
}

export { getTableClient, TABLE_NAME };
