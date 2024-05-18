const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;
let con;

// 連接到MySQL資料庫
async function connectToMySQL(){
  con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'd8ty5mk', // 自己改一下
    database: 'mydb'
  });
  console.log("連接成功"); 
}

// 解析請求體
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 設置跨來源資源共享 (CORS)
app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

// 處理POST請求以創建新商品
app.post('/products', async (req, res) => {
  const { category, name, productCode, imageUrl, description, price } = req.body;
  try {
    // 將資料新增到資料庫
    await con.execute('INSERT INTO products (category, product_name, product_code, imgURL, description, price) VALUES (?, ?, ?, ?, ?, ?)', [category, name, productCode, imageUrl, description, price]);

    console.log('Product added successfully'); // 成功會顯示這個
    res.status(200).send('Product added successfully');
  } catch (error) {
    console.error('Error adding product: ' + error.stack);
    res.status(500).send('Error adding product'); // 失敗是這個
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

connectToMySQL(); // 連接MySQL
