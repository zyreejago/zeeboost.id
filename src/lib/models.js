const { db } = require('./db');

const User = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM User WHERE id = ?', [id]);
  },
  findByEmail: async (email) => {
    return await db.getOne('SELECT * FROM User WHERE email = ?', [email]);
  },
  findByRobloxUsername: async (username) => {
    return await db.getOne('SELECT * FROM User WHERE robloxUsername = ?', [username]);
  },
  create: async (userData) => {
    // Set default timestamps
    const now = new Date();
    const dataWithTimestamps = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    const result = await db.create('User', dataWithTimestamps); // ✅ GANTI db.insert menjadi db.create
    return await User.findById(result.insertId);
  },
  update: async (id, userData) => {
    const dataWithTimestamp = {
      ...userData,
      updatedAt: new Date()
    };
    await db.update('User', dataWithTimestamp, 'id = ?', [id]);
    return await User.findById(id);
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM User ORDER BY createdAt DESC');
  },
  delete: async (id) => {
    return await db.remove('User', 'id = ?', [id]);
  }
};

const Transaction = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM Transaction WHERE id = ?', [id]);
  },
  findByUserId: async (userId) => {
    return await db.getMany('SELECT * FROM Transaction WHERE userId = ? ORDER BY createdAt DESC', [userId]);
  },
  // ✅ TAMBAHKAN METHOD INI
  findByMerchantRef: async (merchantRef) => {
    return await db.getOne('SELECT * FROM Transaction WHERE merchantRef = ?', [merchantRef]);
  },
  findByReference: async (reference) => {
    return await db.getOne('SELECT * FROM Transaction WHERE paymentReference = ?', [reference]);
  },
  create: async (transactionData) => {
    const now = new Date();
    const dataWithTimestamps = {
      ...transactionData,
      createdAt: now,
      updatedAt: now
    };
    const result = await db.create('Transaction', dataWithTimestamps);
    return await Transaction.findById(result.insertId);
  },
  update: async (id, transactionData) => {
    const dataWithTimestamp = {
      ...transactionData,
      updatedAt: new Date()
    };
    await db.update('Transaction', dataWithTimestamp, 'id = ?', [id]);
    return await Transaction.findById(id);
  },
  getAll: async () => {
    // Gunakan LEFT JOIN untuk menghindari error jika tidak ada relasi
    const results = await db.getMany(`
      SELECT t.*, 
             u.robloxUsername, 
             u.email, 
             u.whatsappNumber
      FROM Transaction t 
      LEFT JOIN User u ON t.userId = u.id 
      ORDER BY t.createdAt DESC
    `);
    
    // Transform hasil untuk mengembalikan struktur yang diharapkan
    return results.map(row => ({
      ...row,
      user: {
        robloxUsername: row.robloxUsername,
        email: row.email,
        whatsappNumber: row.whatsappNumber
      }
    }));
  },
  getByStatus: async (status) => {
    const results = await db.getMany(`
      SELECT t.*, 
             u.robloxUsername, 
             u.email, 
             u.whatsappNumber
      FROM Transaction t 
      LEFT JOIN User u ON t.userId = u.id 
      WHERE t.status = ? 
      ORDER BY t.createdAt DESC
    `, [status]);
    
    // Transform hasil untuk mengembalikan struktur yang diharapkan
    return results.map(row => ({
      ...row,
      user: {
        robloxUsername: row.robloxUsername,
        email: row.email,
        whatsappNumber: row.whatsappNumber
      }
    }));
  },
  delete: async (id) => {
    return await db.remove('Transaction', 'id = ?', [id]);
  }
};

const Settings = {
  findByKey: async (key) => {
    return await db.getOne('SELECT * FROM Settings WHERE `key` = ?', [key]);
  },
  update: async (key, value) => {
    const existing = await Settings.findByKey(key);
    if (existing) {
      return await db.update('Settings', { value, updatedAt: new Date() }, '`key` = ?', [key]);
    } else {
      return await db.create('Settings', { key, value, updatedAt: new Date() }); // ✅ GANTI db.insert menjadi db.create
    }
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM Settings');
  }
};

const Banner = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM Banner WHERE id = ?', [id]);
  },
  create: async (bannerData) => {
    return await db.create('Banner', bannerData);
  },
  update: async (id, bannerData) => {
    return await db.update('Banner', bannerData, 'id = ?', [id]);
  },
  delete: async (id) => {
    return await db.remove('Banner', 'id = ?', [id]);
  },
  getActive: async () => {
    return await db.getMany('SELECT * FROM Banner WHERE isActive = 1 ORDER BY `order` ASC');
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM Banner ORDER BY `order` ASC');
  }
};

const Admin = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM Admin WHERE id = ?', [id]);
  },
  findByUsername: async (username) => {
    return await db.getOne('SELECT * FROM Admin WHERE username = ?', [username]);
  },
  create: async (adminData) => {
    return await db.create('Admin', adminData); // ✅ GANTI db.insert menjadi db.create
  },
  update: async (id, adminData) => {
    return await db.update('Admin', adminData, 'id = ?', [id]);
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM Admin ORDER BY createdAt DESC');
  }
};

const News = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM News WHERE id = ?', [id]);
  },
  create: async (newsData) => {
    const result = await db.create('News', newsData);
    console.log('✅ News create result:', result); // Debug log
    console.log('✅ Insert ID:', result.insertId); // Debug log
    return result.insertId;
  },
  update: async (id, newsData) => {
    return await db.update('News', newsData, 'id = ?', [id]);
  },
  delete: async (id) => {
    return await db.remove('News', 'id = ?', [id]);
  },
  getPublished: async () => {
    return await db.getMany('SELECT * FROM News WHERE isPublished = 1 ORDER BY publishedAt DESC');
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM News ORDER BY createdAt DESC');
  }
};

const RobuxStock = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM RobuxStock WHERE id = ?', [id]);
  },
  // Tambahkan fungsi ini di model RobuxStock
  findByAmount: async (amount) => {
    return await db.getOne('SELECT * FROM RobuxStock WHERE amount = ? AND isActive = 1', [amount]);
  },
  
  create: async (stockData) => {
    return await db.create('RobuxStock', stockData); // ✅ GANTI db.insert menjadi db.create
  },
  update: async (id, stockData) => {
    return await db.update('RobuxStock', stockData, 'id = ?', [id]);
  },
  getActive: async () => {
    return await db.getMany('SELECT * FROM RobuxStock WHERE isActive = 1 AND allowOrders = 1 ORDER BY amount ASC');
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM RobuxStock ORDER BY amount ASC');
  }
};

const Discount = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM Discount WHERE id = ?', [id]);
  },
  findByCode: async (code) => {
    return await db.getOne('SELECT * FROM Discount WHERE code = ?', [code]);
  },
  create: async (discountData) => {
    return await db.create('Discount', discountData);
  },
  update: async (id, discountData) => {
    return await db.update('Discount', discountData, 'id = ?', [id]);
  },
  getActive: async () => {
    const now = new Date();
    return await db.getMany(
      'SELECT * FROM Discount WHERE isActive = 1 AND (validUntil IS NULL OR validUntil > ?) AND (maxUses = 0 OR currentUses < maxUses) ORDER BY createdAt DESC',
      [now]
    );
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM Discount ORDER BY createdAt DESC');
  }
};

const RobuxTheme = {
  findById: async (id) => {
    return await db.getOne('SELECT * FROM RobuxTheme WHERE id = ?', [id]);
  },
  create: async (themeData) => {
    const now = new Date();
    const dataWithTimestamps = {
      ...themeData,
      createdAt: now,
      updatedAt: now
    };
    return await db.create('RobuxTheme', dataWithTimestamps);
  },
  update: async (id, themeData) => {
    const dataWithTimestamp = {
      ...themeData,
      updatedAt: new Date()
    };
    return await db.update('RobuxTheme', dataWithTimestamp, 'id = ?', [id]);
  },
  delete: async (id) => {
    return await db.remove('RobuxTheme', 'id = ?', [id]);
  },
  getActive: async () => {
    return await db.getMany('SELECT * FROM RobuxTheme WHERE isActive = 1 ORDER BY `order` ASC');
  },
  getAll: async () => {
    return await db.getMany('SELECT * FROM RobuxTheme ORDER BY `order` ASC');
  }
};

module.exports = {
  User,
  Transaction,
  Settings,
  Banner,
  Admin,
  News,
  RobuxStock,
  Discount,
  RobuxTheme
};