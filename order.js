const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3009;

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

// 處理訂單提交的 POST 請求
app.post('/submit-order', async (req, res) => {
  console.log('Request Body:', req.body); // 檢查是否傳遞了正確的數據
  const { user, delivery, cartItems, totalAmount, message } = req.body;

  try {
    await con.beginTransaction();

    // 插入訂單資料到 orders 表
    const [orderResult] = await con.execute(`
      INSERT INTO orders (user_id, name, email, tel, gender, delivery_address, delivery_datetime, total_amount) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.userId, 
      user.name,
      user.email, 
      user.tel, 
      user.gender,
      delivery.deliveryAddress, 
      delivery.deliveryDateTime, 
      totalAmount
    ]);

    const orderId = orderResult.insertId;
    console.log('Order Result:', orderResult);

    // 插入購物車商品資料到 order_items 表
    for (const item of cartItems) {
      await con.execute(`
        INSERT INTO order_items (order_id, product_code, product_name, imgURL, quantity, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId, 
        item.product_code, 
        item.product_name, 
        item.imgURL,
        item.quantity, 
        item.price
      ]);

      // 更新商品表中的數量
      const [productResult] = await con.execute(`
        UPDATE products 
        SET quantity = quantity - ?
        WHERE product_code = ? AND quantity >= ?
      `, [
        item.quantity, 
        item.product_code,
        item.quantity
      ]);

      if (productResult.affectedRows === 0) {
        throw new Error(`更新商品編碼 ${item.product_code} 的數量失敗，可能庫存不足`);
      }
    }

    await con.commit();
    res.status(200).json({ orderId }); // 返回 orderId
    console.log(orderId);
  } catch (error) {
    await con.rollback();
    console.error('提交訂單失敗', error);
    res.status(500).json({ error: '提交訂單失敗' });
  }
});



// 獲取訂單詳細資訊的 GET 請求
app.get('/order/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // 獲取訂單基本資料
    const [orderRows] = await con.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);  // 使用 'id' 而不是 'order_id'

    if (orderRows.length === 0) {
      return res.status(404).json({ error: '找不到訂單' });
    }

    const order = orderRows[0];

    // 獲取訂單中的商品資料
    const [orderItemsRows] = await con.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [orderId]);

    // 構造回應的訂單詳細資料
    const orderDetails = {
      orderId: order.id,  // 使用 'id' 而不是 'order_id'
      orderDate: order.created_at,  // 確認你的 orders 表中有適當的日期欄位
      totalAmount: order.total_amount,
      delivery: {
        deliveryAddress: order.delivery_address,
        deliveryDateTime: order.delivery_datetime
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

app.get('/orders/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [orders] = await con.execute('SELECT * FROM orders WHERE user_id = ?', [userId]);

    if (orders.length === 0) {
      return res.status(404).json({ message: '沒有找到該用戶的訂單' });
    }

    const ordersWithItems = [];
    for (const order of orders) {
      const [orderItems] = await con.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      ordersWithItems.push({
        orderName: order.name,
        orderEmail: order.email,
        orderTel: order.tel,
        orderGender: order.gender,
        orderAddress: order.delivery_address,
        tradeDateTime: order.delivery_datetime,
        orderId: order.id,
        orderDate: order.created_at, // 假設有 created_at 欄位
        totalAmount: order.total_amount,
        items: orderItems
      });
    }

    res.status(200).json({ orders: ordersWithItems });
  } catch (error) {
    console.error('獲取訂單失敗', error);
    res.status(500).json({ error: '獲取訂單失敗' });
  }
});





app.listen(port, () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
});

connectToMySQL();
