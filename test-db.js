require("dotenv").config();
const mariadb = require("mariadb");

async function test() {
    let conn;

    try {
       conn = await mariadb.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    allowPublicKeyRetrieval: true
});

        console.log("✅ Conexión directa a MariaDB OK");

        const rows = await conn.query("SELECT 1 AS resultado");

        console.log(rows);
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        if (conn) await conn.end();
    }
}

test();