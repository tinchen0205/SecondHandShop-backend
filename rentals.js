const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors'); // 使用 cors 中间件

const app = express();
const port = 3010; // 設定後端伺服 port
let con;

// 連接到 MySQL 資料庫
async function connectToMySQL() {
  con = await mysql.createConnection({
    host: '35.194.152.13',
    user: 'root',
    password: 'mRPyuj^9Be`GsK>L', // 修改為你的密碼
    database: 'puproject' // 修改為你的資料庫名稱
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
app.get('/getRentals', async (req, res) => {
  const name = req.query.name;
  try {
    if (name) {
      // 根据商品名称查询
      const [rows] = await con.execute('SELECT * FROM rentals WHERE product_name = ?', [name]);
      res.json(rows);
    } else {
      // 返回所有商品
      const [rows] = await con.execute('SELECT imgURL, product_name, status, rental_days, price FROM rentals');
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching rental products: ' + error.stack);
    res.status(500).send('Error fetching rental products');
  }
});
app.get('/Rentalkeywordsearch', async (req, res) => {
    const searchQuery = req.query.query;
  
    try {
      const [rows] = await con.execute('SELECT imgURL, product_name, description, price FROM rentals WHERE product_name LIKE ?', [`%${searchQuery}%`]);
      res.json(rows);
    } catch (error) {
      console.error('查詢產品失敗:', error);
      res.status(500).send('查詢產品失敗');
    }
  });
  app.get('/Rentalcategorysearch', async (req, res) => {
    const category = req.query.category
    // 根據 category 從數據庫中查找商品
    // 假設這裡有個函數 getProductsByCategory
    try {
        const [rows] = await con.execute('SELECT imgURL, product_name, description, price FROM rentals WHERE category LIKE ?', [`%${category}%`]);
        res.json(rows);
      } catch (error) {
        console.error('查詢產品失敗:', error);
        res.status(500).send('查詢產品失敗');
      }
    });

    app.post('/submit-rentalorder', async (req, res) => {
      console.log('Request Body:', req.body); // 检查是否传递了正确的数据
      const { user, delivery, rentalItem, totalAmount, message } = req.body; // 注意這裡使用 rentalItem
  
      try {
          await con.beginTransaction();
  
          // 插入订单资料到 rental_orders 表
          const [orderResult] = await con.execute(`
            INSERT INTO rental_orders (user_id, name, email, tel, gender, delivery_address, delivery_datetime, return_datetime, total_amount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
              user.userId, 
              user.name,
              user.email, 
              user.tel, 
              user.gender,
              delivery.deliveryAddress, 
              delivery.deliveryDateTime,
              delivery.returnDateTime,
              totalAmount
          ]);
  
          const orderId = orderResult.insertId;
          console.log('Order Result:', orderResult);
  
          // 插入租赁商品资料到 rental_order_items 表
          await con.execute(`
            INSERT INTO rental_order_items (order_id, product_id, product_name, imgURL, quantity, price, days, seller)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
              orderId, 
              rentalItem.id,  // 使用 rentalItem 對象的屬性
              rentalItem.product_name, 
              rentalItem.imgURL,
              rentalItem.quantity, 
              rentalItem.price,
              rentalItem.days,
              rentalItem.seller
          ]);
  
          // 更新 rentals 表中的 status 欄位為 "已出租"
          const [rentalUpdateResult] = await con.execute(`
            UPDATE rentals 
            SET status = '已出租'
            WHERE id = ?
          `, [
              rentalItem.id // 確保這裡使用正確的 product_id
          ]);
  
          if (rentalUpdateResult.affectedRows === 0) {
              throw new Error(`无法更新商品编码 ${rentalItem.id} 的状态，可能商品不存在`);
          }
  
          await con.commit();
          res.status(200).json({ orderId }); // 返回 orderId
          console.log(orderId);
      } catch (error) {
          await con.rollback();
          console.error('提交订单失败', error);
          res.status(500).json({ error: '提交订单失败' });
      }
  });
  
  // 獲取訂單詳細資訊的 GET 請求
app.get('/rentalorder/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // 獲取訂單基本資料
    const [orderRows] = await con.execute(`
      SELECT * FROM rental_orders WHERE id = ?
    `, [orderId]);  // 使用 'id' 而不是 'order_id'

    if (orderRows.length === 0) {
      return res.status(404).json({ error: '找不到訂單' });
    }

    const order = orderRows[0];

    // 獲取訂單中的商品資料
    const [orderItemsRows] = await con.execute(`
      SELECT * FROM rental_order_items WHERE order_id = ?
    `, [orderId]);

    // 構造回應的訂單詳細資料
    const orderDetails = {
      orderId: order.id,  // 使用 'id' 而不是 'order_id'
      orderDate: order.created_at,  // 確認你的 orders 表中有適當的日期欄位
      totalAmount: order.total_amount,
      delivery: {
        deliveryAddress: order.delivery_address,
        deliveryDateTime: order.delivery_datetime,
        returnDateTime: order.returnDateTime
      },
      user: {
        name: order.name,
        email: order.email,
        tel: order.tel,
        gender: order.gender
      },
      items: orderItemsRows
    };

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error('獲取訂單詳情失敗', error);
    res.status(500).json({ error: '獲取訂單詳情失敗' });
  }
});
    
    
    

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
