const { Pool } = require('pg');
const p = new Pool({connectionString:'postgresql://neondb_owner:npg_qG1VEDPCd9ON@ep-divine-sunset-aoif4upm-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'});
p.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'").then(r=>{console.log(r.rows);p.end()});
