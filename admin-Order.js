const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors'); // 使用 cors 中間件

const app = express();
const port = 3012; // 設定後端伺服 port
let con;

// 連接到 MySQL 資料庫
async function connectToMySQL() {
  con = await mysql.createConnection({
    host: '35.194.152.13',
    user: 'root',
    password: 'mRPyuj^9Be`GsK>L', // 修改為你的密碼
    database: 'puproject' // 修改為你的資料庫名稱
  });
  console.log("連接成功admin");
}

connectToMySQL(); // 連接 MySQL

// 設置 CORS
app.use(cors());

// 解析請求體
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// show Products
app.get('/products', async (req, res) => {
  try {                                                 //改成你自己的
    const [rows] = await con.execute("SELECT id, DATE_FORMAT(delivery_datetime, '%Y-%m-%d') AS delivery_datetime, total_amount FROM orders");
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users: ' + error.stack);
    res.status(500).send('Error fetching users');
  }
});


// 啟動伺服器
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening at http://localhost:${port} 這是admin-Products`);
});