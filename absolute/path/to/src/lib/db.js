// ... existing code ...
async function insert(table, data) {
  try {
    console.log(`Inserting into ${table}:`, data);
    
    // Konversi nilai boolean ke 0/1 untuk MySQL
    const processedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === true) processedData[key] = 1;
      else if (value === false) processedData[key] = 0;
      else if (value === undefined) processedData[key] = null;
      else processedData[key] = value;
    }
    
    const keys = Object.keys(processedData);
    const values = Object.values(processedData);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    console.log('SQL Query:', sql);
    console.log('Values:', values);
    
    const result = await query(sql, values);
    return {
      id: result.insertId,
      ...processedData
    };
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    console.error('SQL Error Code:', error.code);
    console.error('SQL Error Message:', error.message);
    console.error('SQL Error State:', error.sqlState);
    console.error('Data that caused error:', data);
    throw error;
  }
}
// ... existing code ...