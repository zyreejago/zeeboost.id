const mysql = require('mysql2/promise');

// Buat pool koneksi
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3, // Reduced from 10 to prevent overwhelming the database
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  idleTimeout: 300000, // Close idle connections after 5 minutes
  reconnect: true
});

// Test koneksi saat startup
pool.getConnection()
  .then(async connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Fungsi untuk menjalankan query
async function query(sql, params) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Query error:', {
      sql: sql,
      params: params,
      error: error.message
    });
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Fungsi helper untuk operasi database
const db = {
  // Get single record
  getOne: async (sql, params = []) => {
    const rows = await query(sql, params);
    return rows[0] || null;
  },

  // Get multiple records
  getMany: async (sql, params = []) => {
    return await query(sql, params);
  },

  // Insert record
  create: async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    // Escape reserved keywords
    const escapedKeys = keys.map(key => {
      const reservedKeywords = ['order', 'key', 'group', 'index', 'limit', 'offset'];
      return reservedKeywords.includes(key.toLowerCase()) ? `\`${key}\`` : key;
    }).join(', ');
    
    const sql = `INSERT INTO ${table} (${escapedKeys}) VALUES (${placeholders})`;
    
    let connection;
    try {
      connection = await pool.getConnection();
      const [result] = await connection.execute(sql, values);
      console.log('✅ Insert result:', result); // Debug log
      return result; // Ini adalah ResultSetHeader dengan insertId
    } catch (error) {
      console.error('❌ Insert error:', {
        sql: sql,
        params: values,
        error: error.message
      });
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  // Update record
  update: async (table, data, whereClause, whereParams = []) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    // Escape column names that are reserved keywords
    const setClause = keys.map(key => {
      const escapedKey = ['order', 'key', 'group', 'index'].includes(key.toLowerCase()) ? `\`${key}\`` : key;
      return `${escapedKey} = ?`;
    }).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const result = await query(sql, [...values, ...whereParams]);
    return result.affectedRows;
  },

  // Delete record
  remove: async (table, whereClause, whereParams = []) => {
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const result = await query(sql, whereParams);
    return result.affectedRows;
  }
};

module.exports = { db, pool, query };