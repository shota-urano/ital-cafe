-- Create database if not exists (optional, as docker-compose creates it)
-- CREATE DATABASE IF NOT EXISTS ital_cafe;

-- Set timezone
SET timezone = 'Asia/Tokyo';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Initial setup message
DO $$
BEGIN
  RAISE NOTICE 'Database initialized successfully';
END
$$;
