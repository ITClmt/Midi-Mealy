import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection URL
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres connection
const client = postgres(DATABASE_URL, {
	max: 10, // Connection pool size
	idle_timeout: 20,
	connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export client for raw queries if needed
export { client };
