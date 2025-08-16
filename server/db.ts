import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// MySQL connection configuration for Hostinger
// Solo se conecta en producción (Hostinger)
let db: any = null;
let connectionAttempted = false;

export function getDB() {
  if (!connectionAttempted) {
    connectionAttempted = true;
    
    // Solo intentar conectar en producción (detectar por NODE_ENV o hostname)
    if (process.env.NODE_ENV === 'production' || process.env.HOSTINGER_DB === 'true') {
      try {
        const connection = mysql.createConnection({
          host: 'localhost',
          user: 'u691951636_storeuser',
          password: 'I3&B0/gr[',
          database: 'u691951636_storedb',
          port: 3306,
        });
        
        db = drizzle(connection, { schema, mode: 'default' });
        console.log('Connected to MySQL database');
      } catch (error) {
        console.log('MySQL connection failed, using development mode');
        db = null;
      }
    } else {
      console.log('Development mode: using mock data instead of MySQL');
      db = null;
    }
  }
  
  return db;
}

export { db };