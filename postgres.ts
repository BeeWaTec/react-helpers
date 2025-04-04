import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT ?? "5432", 10),
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
