/**
 * Runs a .sql file against the MySQL server configured in .env.
 * Usage: node db/run-sql.js db/schema.sql
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node db/run-sql.js <path-to-sql-file>');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.resolve(file), 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log(`Applied ${file} successfully.`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Failed to run SQL file:', err.message);
  process.exit(1);
});
