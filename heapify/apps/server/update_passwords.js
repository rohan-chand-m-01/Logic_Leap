const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const p = new Pool({connectionString:'postgresql://neondb_owner:npg_qG1VEDPCd9ON@ep-divine-sunset-aoif4upm-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'});

async function updatePasswords() {
  const hash = await bcrypt.hash('Admin@1234', 10);
  await p.query('UPDATE users SET password_hash = $1, registration_complete = true', [hash]);
  console.log('Passwords updated to Admin@1234');
  p.end();
}

updatePasswords().catch(console.error);
