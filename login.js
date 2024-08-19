const express = require('express');//使用express
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3000; //設定後端伺服port
let con ;
// 連接到MySQL資料庫
async function connectToMySQL(){
 con = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secondhandshop',
  database: 'mydb'
});
console.log("連接成功"); 
}

//解析请求体
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//這段程式碼用於設置跨來源資源共享 (CORS) 的相關標頭，以允許瀏覽器從不同的來源訪問伺服器端的資源，同時保持安全性
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header('Access-Control-Allow-Methods','PUT,GET,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers","X-Requested-With");
    res.header('Access-Control-Allow-Headers','Content-Type');
    next();
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
    try {
      // 使用 con.execute() 代替 db.query()
      const [results, fields] = await con.execute(query, [email, password]);
      if (results.length === 1) {
        // 如果登录成功，从数据库结果中获取用户名
        const { id,name } = results[0]; // 假设数据库中有名为 'name' 的列
        // 将用户名包含在响应中
        res.json({ id,name, message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
        //res.status(401).send('Invalid email or password' );
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
      //res.status(500).send('Internal server error' );
    }
  });
// 啟動伺服器  指令node 檔名  ex. node app.js  關掉 ctrl + c
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port} 這是Login` );
});

connectToMySQL(); //連接MySQL