-- HudumaTech Database Reset Script
-- This script drops all existing tables and recreates them from scratch
-- WARNING: This will DELETE ALL DATA in your database
-- Only run this in development or when you want a fresh start

-- =======================
-- CONFIRMATION NOTICE
-- =======================
DO
$$
BEGIN
    RAISE
NOTICE '=== DATABASE RESET SCRIPT ===';
    RAISE
NOTICE 'This will DELETE ALL DATA in your database!';
    RAISE
NOTICE 'Make sure you have backups if needed.';
    RAISE
NOTICE 'Script starting in 3 seconds...';
    PERFORM
pg_sleep(3);
    RAISE
NOTICE 'Starting database reset...';
END
$$;

BEGIN;

-- =======================
-- DROP ALL VIEWS FIRST
-- =======================
DROP VIEW IF EXISTS admin_stats CASCADE;
DROP VIEW IF EXISTS service_providers_with_verified CASCADE;
DROP VIEW IF EXISTS provider_categories_view CASCADE;
DROP VIEW IF EXISTS active_service_locations CASCADE;
DROP VIEW IF EXISTS active_service_categories CASCADE;

-- =======================
-- DROP ALL FUNCTIONS AND TRIGGERS
-- =======================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =======================
-- DROP ALL TABLES IN CORRECT ORDER (reverse foreign key dependencies)
-- =======================

-- Drop tables with foreign keys first
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;

-- Drop dynamic system tables
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS service_locations CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;

-- Drop core tables last
DROP TABLE IF EXISTS users CASCADE;

-- =======================
-- DROP ANY REMAINING OBJECTS
-- =======================

-- Drop any remaining sequences
DROP SEQUENCE IF EXISTS service_categories_sort_order_seq CASCADE;
DROP SEQUENCE IF EXISTS service_locations_sort_order_seq CASCADE;

-- Drop any custom types if they exist
DROP TYPE IF EXISTS report_type_enum CASCADE;
DROP TYPE IF EXISTS report_status_enum CASCADE;
DROP TYPE IF EXISTS verification_status_enum CASCADE;
DROP TYPE IF EXISTS message_type_enum CASCADE;
DROP TYPE IF EXISTS sender_type_enum CASCADE;

-- =======================
-- VERIFY ALL TABLES ARE DROPPED
-- =======================
DO
$$
DECLARE
table_count INTEGER;
    view_count
INTEGER;
BEGIN
SELECT COUNT(*)
INTO table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%';

SELECT COUNT(*)
INTO view_count
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%';

RAISE
NOTICE 'Remaining tables: %', table_count;
    RAISE
NOTICE 'Remaining views: %', view_count;

    IF
table_count > 0 THEN
        RAISE NOTICE 'WARNING: Some tables still exist. Check for dependencies.';
ELSE
        RAISE NOTICE 'SUCCESS: All tables dropped successfully.';
END IF;
END
$$;