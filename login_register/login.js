// login.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// 連接mysql
let con ;
async function ConnectToMySQL(){
    con = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password:'12345678',
        database:'mydb',
    });
    console.log("success");
}
router.post('/login', async (req, res)=>{
    try{
        //執行查詢，獲取用戶資料
        const [rows,fields] = await con.execute('SELECT * FROM account WHERE email= ? AND password=?',[req.body.email,req.body.password]);
        // 如果查詢不是空的，表示有找到
        if (rows.length > 0){
            const user =row[0];
            //將user 訊息發回前端
            res.status(200).json({message :'Login Successful',user});
        }else{
            res.status(404).json({message :'User not found'});
        }
    }catch{
        console.error('Error fetching user data from database: ', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

ConnectToMySQL(); //連接MySQL
