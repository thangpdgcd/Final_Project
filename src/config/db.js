import mysql from 'mysql2';

// IMPORTANT:
// - Do NOT auto-load `.env` here (it can override `.env.production` / hosting envs).
// - `server.js` is responsible for loading the correct env file.

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
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
    console.error("Kết nối thất bại: " + err.stack);
    return;
  }
  console.log("Kết nối thành công với ID " + conn.threadId);
  conn.release();
});

export default connection;