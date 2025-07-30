import{neon} from "@neondatabase/serverless"

import "dotenv/config";

// Creates a Neon database connection using the DATABASE_URL from the environment variables
// The connection is exported for use in other parts of the application
export const sql = neon(process.env.DATABASE_URL);