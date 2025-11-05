-- Rollback: Remove unique constraint from NRP column
-- Date: 2025-11-04
-- Description: Removes the unique constraint from the nrp column in users table

-- Drop the unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_nrp_unique;

-- Drop the index
DROP INDEX IF EXISTS idx_users_nrp;
