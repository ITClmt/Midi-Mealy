import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const runMigrations = async () => {
	console.log("🔄 Running migrations...");

	const connection = postgres(DATABASE_URL, { max: 1 });
	const db = drizzle(connection);

	try {
		await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
		console.log("✅ Migrations completed successfully!");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	} finally {
		await connection.end();
	}
};

runMigrations();
