const express = require('express'); // 使用express
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3000; // 設定後端伺服port
let con;

// 連接到MySQL資料庫
async function connectToMySQL() {
  try {
    con = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'secondhandshop',
      database: 'mydb'
    });
    console.log("連接成功");
  } catch (error) {
    console.error("無法連接到資料庫", error);
  }
}

// 解析请求体
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 設置 CORS 標頭
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

// 登入路由
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
  try {
    // 使用 con.execute() 代替 db.query()
    const [results] = await con.execute(query, [email, password]);
    if (results.length === 1) {
      // 如果登入成功，從資料庫結果中獲取用戶信息
      const { id, name } = results[0];
      // 將用戶信息包含在響應中
      res.json({ id, name, message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('登入錯誤', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 獲取用戶資料路由
app.get('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const query = 'SELECT * FROM user WHERE id = ?';
    const [results] = await con.execute(query, [userId]);
    if (results.length === 1) {
      const user = results[0];
      res.json(user);
    } else {
      res.status(404).json({ error: '用戶不存在' });
    }
  } catch (error) {
    console.error('獲取用戶資料錯誤', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

connectToMySQL(); // 連接MySQL
