import 'dotenv/config';
import mysql from 'mysql2';

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
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