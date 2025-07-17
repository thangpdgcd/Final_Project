// db.js
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "", // Mặc định XAMPP MySQL không có password
  database: "coffee",
});

connection.connect((err) => {
  if (err) {
    console.error("Kết nối thất bại: " + err.stack);
    return;
  }
  console.log("Kết nối thành công với ID " + connection.threadId);
});

module.exports = connection;
