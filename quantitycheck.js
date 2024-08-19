const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3008;

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
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

// 定義 API 端點來獲取產品庫存數量
app.get('/checkquantity/:productCode', async (req, res) => {
    const productCode = req.params.productCode;
    
    try {
      const [results] = await con.query('SELECT quantity FROM products WHERE product_code = ?', [productCode]);
      
      if (results.length > 0) {
        // 返回產品的庫存數量
        res.json({ quantity: results[0].quantity });
      } else {
        res.status(404).json({ error: '產品未找到' });
      }
    } catch (error) {
      console.error('資料庫查詢錯誤: ', error);
      res.status(500).json({ error: '無法獲取產品庫存' });
    }
});

app.listen(port, () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
});

connectToMySQL();
