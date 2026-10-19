const mysql = require('mysql2/promise');
const { logger } = require('./logger');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'student_user',
  password: process.env.DB_PASSWORD || 'student_pass123',
  database: process.env.DB_NAME || 'student_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

async function initDB(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      logger.info(`Đang kết nối Database MySQL (${dbConfig.host}:${dbConfig.port}) - Lần thử ${i}/${retries}...`);
      pool = mysql.createPool(dbConfig);
      const conn = await pool.getConnection();
      logger.info('Kết nối CSDL MySQL thành công!');
      conn.release();
      return pool;
    } catch (err) {
      logger.error(`Kết nối CSDL thất bại (Lần ${i}): ${err.message}`);
      if (i < retries) {
        logger.warn(`Thử lại sau ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error('Không thể kết nối đến MySQL sau nhiều lần thử!');
      }
    }
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool chưa được khởi tạo!');
  }
  return pool;
}

module.exports = { initDB, getPool };
