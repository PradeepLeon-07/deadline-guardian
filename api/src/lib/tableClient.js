import { TableClient, TableServiceClient } from "@azure/data-tables";

const CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING;
const TABLE_NAME = "Deadlines";

async function getTableClient() {
  const serviceClient = TableServiceClient.fromConnectionString(CONNECTION_STRING);
  await serviceClient.createTable(TABLE_NAME).catch(() => {}); // ignore if already exists
  return TableClient.fromConnectionString(CONNECTION_STRING, TABLE_NAME);
}

export { getTableClient, TABLE_NAME };
