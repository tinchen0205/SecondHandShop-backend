// app.js
const express = require('express');//使用express
const bodyParser = require('body-parser'); 

const app = express();
const port = 3000; //設定後端伺服port

const loginRouter =require('./login_register/login.js');
const registerRouter =require('./login_register/register.js');
const { application } = require('express');

app.use ('/register',registerRouter);
app.use ('/login',loginRouter);
//解析请求体
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())



//這段程式碼用於設置跨來源資源共享 (CORS) 的相關標頭，以允許瀏覽器從不同的來源訪問伺服器端的資源，同時保持安全性
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header('Access-Control-Allow-Methods','PUT,GET,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers","X-Requested-With");
    res.header('Access-Control-Allow-Headers','Content-Type');
    next();
})



// 啟動伺服器  指令node 檔名  ex. node app.js  關掉 ctrl + c
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

