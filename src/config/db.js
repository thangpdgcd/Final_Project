import mysql from 'mysql2';

// IMPORTANT:
// - Do NOT auto-load `.env` here (it can override `.env.production` / hosting envs).
// - `server.js` is responsible for loading the correct env file.

const connection = mysql.createPool({
  host: process.env.DB_HOST
  || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    // TiDB Cloud serverless requires TLS.
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
});

connection.getConnection((err, conn) => {
  if (err) {
    console.error("Pool connection failed: " + err.stack);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("MySQL pool connected, thread " + conn.threadId);
  }
  conn.release();
});

export default connection;