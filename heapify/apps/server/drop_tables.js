const { Pool } = require('pg');
const p = new Pool({connectionString:'postgresql://neondb_owner:npg_qG1VEDPCd9ON@ep-divine-sunset-aoif4upm-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'});
p.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;').then(() => {
  console.log('dropped schema');
  p.end();
}).catch(e => {
  console.error(e);
  p.end();
});
