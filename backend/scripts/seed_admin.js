// seed_admin.js
// 用法: node seed_admin.js
// 需要在 backend 文件夹下运行，确保安装了 pg 和 bcryptjs
// npm install pg bcryptjs dotenv

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'driver_state_analysis',
  });

  try {
    await client.connect();
    const username = 'admin';
    const email = 'admin@example.com';
    const password = 'Admin123!'; // 启动后请立即更改
    const fullName = 'Administrator';

    // 先检查是否存在
    const check = await client.query('SELECT id FROM users WHERE username=$1 OR email=$2', [username, email]);
    if (check.rows.length > 0) {
      console.log('User already exists. Skipping insert.');
      process.exit(0);
    }

    // 生成 bcrypt 哈希
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const res = await client.query(
      'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1,$2,$3,$4) RETURNING id, username, email, full_name, created_at',
      [username, email, hash, fullName]
    );

    console.log('Inserted user:', res.rows[0]);
    console.log('Please change the default password after first login.');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.end();
  }
})();