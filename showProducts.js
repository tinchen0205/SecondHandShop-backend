const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors'); // 使用 cors 中間件

const app = express();
const port = 3005; // 設定後端伺服 port
let con;

// 連接到 MySQL 資料庫
async function connectToMySQL() {
  con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'd8ty5mk', // 修改為你的密碼
    database: 'mydb' // 修改為你的資料庫名稱
  });
  console.log("連接成功admin");
}

connectToMySQL(); // 連接 MySQL

// 設置 CORS
app.use(cors());

// 解析請求體
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 獲取所有使用者數據
app.get('/products', async (req, res) => {
  try {                                                 //改成你自己的
    const [rows] = await con.execute('SELECT imgURL , product_name , description ,price FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users: ' + error.stack);
    res.status(500).send('Error fetching users');
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port} 這是前端首頁showProducts`);
});
