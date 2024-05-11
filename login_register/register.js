// app.js
const express = require('express');//使用express
const router = express.Router(); // 创建路由器对象
const mysql = require('mysql2/promise'); 


let con ;
// 連接到MySQL資料庫
async function connectToMySQL(){
 con = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'mydb'
});
console.log("連接成功"); 
}


//這段程式碼用於設置跨來源資源共享 (CORS) 的相關標頭，以允許瀏覽器從不同的來源訪問伺服器端的資源，同時保持安全性
// router.use(function(req,res,next){
//     res.header("Access-Control-Allow-Origin","*");
//     res.header('Access-Control-Allow-Methods','PUT,GET,POST,DELETE,OPTIONS');
//     res.header("Access-Control-Allow-Headers","X-Requested-With");
//     res.header('Access-Control-Allow-Headers','Content-Type');
//     next();
// })

//處理POST請求以創建新用戶 這裡個/resister 要跟你網頁前端 await axios.post('http://localhost:3000/register/' 使用一樣的
router.post('/register', async (req, res,) => {
    const { email, password, name } = req.body; 
    try {
    
    await con.execute('INSERT INTO  account(email,password,name) VALUES (?, ?, ?)', [email, password, name]);// 把資料新增到資料庫
    
    console.log('User registered successfully');//成功會顯示這個
    res.status(200).send('User registered successfully');
    } catch (error) {
    console.error('Error registering user: ' + error.stack);
    res.status(500).send('Error registering user'); //失敗是這個
    }
});

        connectToMySQL(); //連接MySQL
        module.exports = router;
        