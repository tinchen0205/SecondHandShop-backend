const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors'); // 使用 cors 中間件

const app = express();
const port = 3003; // 設定後端伺服 port
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

// show Products
app.get('/products', async (req, res) => {
  try {                                                 //改成你自己的
    const [rows] = await con.execute('SELECT category , product_name , product_code , price FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users: ' + error.stack);
    res.status(500).send('Error fetching users');
  }
});
// add Products
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
//delete Products
app.delete('/products/:product_code', async (req, res) => {
  try {
    const { product_code } = req.params;
    const [result] = await con.execute('DELETE FROM products WHERE product_code = ?', [product_code]);
    if (result.affectedRows > 0) {
      res.status(200).send('Product deleted successfully');
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error deleting product: ' + error.stack);
    res.status(500).send('Error deleting product');
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port} 這是admin-Products`);
});
