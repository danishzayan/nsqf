import db from './config/db.js';

async function testConnection() {
  try {
    const result = await db.raw('SELECT 1+1 AS sum');
    console.log('✅ DB Connected:', result[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ DB Connection Failed:', err);
    process.exit(1);
  }
}

testConnection();
