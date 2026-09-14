import pkg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.NODE_ENV === "test"
        ? process.env.TEST_DATABASE_URL
        : process.env.DATABASE_URL,
});

console.log("Connected to: ", pool.options.connectionString);

export default pool;