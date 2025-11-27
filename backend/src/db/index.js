// backend/src/db/index.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
let pool;

async function initDb(){
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Optionally run migrations (safe)
  const migrations = path.join(__dirname, '..', '..', 'scripts', 'migrations.sql');
  if (fs.existsSync(migrations)){
    const sql = fs.readFileSync(migrations).toString();
    await pool.query(sql);
  }
  console.log('DB initialized');
}

function getClient(){
  if(!pool){
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

module.exports = { initDb, getClient };
