import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// MySQL connection configuration for Hostinger
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'u691951636_storeuser',
  password: 'I3&B0/gr[',
  database: 'u691951636_storedb',
  port: 3306,
});

export const db = drizzle(connection, { schema });