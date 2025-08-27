-- Agregar campos de tracking de conexiones a la tabla customers
ALTER TABLE customers
ADD COLUMN first_connection DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE customers
ADD COLUMN last_connection DATETIME DEFAULT CURRENT_TIMESTAMP;