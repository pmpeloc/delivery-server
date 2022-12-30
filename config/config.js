const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'delivery',
  // port: 3006,
});

db.connect((err) => {
  if (err) throw err;
  console.log('Database connected');
});

module.exports = db;
