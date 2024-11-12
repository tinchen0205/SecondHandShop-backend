const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3006;

let con;

async function connectToMySQL() {
  try {
    con = await mysql.createConnection({
    host: '35.194.152.13',
    user: 'root',
    password: 'mRPyuj^9Be`GsK>L', // 修改為你的密碼
    database: 'puproject' // 修改為你的資料庫名稱
    });
    console.log("連接成功");
  } catch (error) {
    console.error("無法連接到MySQL:", error);
    process.exit(1); // 如果無法連接到MySQL，退出應用程序
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/keywordsearch', async (req, res) => {
  const searchQuery = req.query.query;

  try {
    const [rows] = await con.execute('SELECT imgURL, product_name, description, price FROM products WHERE product_name LIKE ?', [`%${searchQuery}%`]);
    res.json(rows);
  } catch (error) {
    console.error('查詢產品失敗:', error);
    res.status(500).send('查詢產品失敗');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
});

connectToMySQL();
