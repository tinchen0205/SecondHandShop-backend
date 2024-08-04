const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors'); // 使用 cors 中间件

const app = express();
const port = 3005; // 設定後端伺服 port
let con;

// 連接到 MySQL 資料庫
async function connectToMySQL() {
  con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'secondhandshop', // 修改為你的密碼
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

// 獲取商品數據
app.get('/products', async (req, res) => {
  const name = req.query.name;
  try {
    if (name) {
      // 根据商品名称查询
      const [rows] = await con.execute('SELECT * FROM products WHERE product_name = ?', [name]);
      res.json(rows);
    } else {
      // 返回所有商品
      const [rows] = await con.execute('SELECT imgURL, product_name, description, price FROM products');
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching products: ' + error.stack);
    res.status(500).send('Error fetching products');
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
