const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3007;

let con;

async function connectToMySQL() {
  try {
    con = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'secondhandshop', // 請確認你的MySQL密碼是否正確
      database: 'mydb'
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

app.get('/categorysearch', async (req, res) => {
    const category = req.query.category
    // 根據 category 從數據庫中查找商品
    // 假設這裡有個函數 getProductsByCategory
    try {
        const [rows] = await con.execute('SELECT imgURL, product_name, description, price FROM products WHERE category LIKE ?', [`%${category}%`]);
        res.json(rows);
      } catch (error) {
        console.error('查詢產品失敗:', error);
        res.status(500).send('查詢產品失敗');
      }
    });
    

app.listen(port, () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
});

connectToMySQL();
