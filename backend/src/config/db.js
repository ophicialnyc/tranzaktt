import{neon} from "@neondatabase/serverless"

import "dotenv/config";

// Creates a Neon database connection using the DATABASE_URL from the environment variables
// The connection is exported for use in other parts of the application
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS Transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE,
            updated_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`
        console.log("Table created successfully")
    } catch (error) {
        console.log("Error creating table:", error)
        process.exit(1); //status code 1 means error and 0 means success
    }
}