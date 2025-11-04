-- Migration: Add unique constraint to NRP column
-- Date: 2025-11-04
-- Description: Adds a unique constraint to the nrp column in users table to prevent duplicate NRP values

-- First, check if there are any duplicate NRPs (should be none based on our check)
-- If duplicates exist, they need to be resolved before running this migration

-- Add unique constraint to nrp column
-- Note: This allows NULL values, multiple users can have NULL nrp, but non-NULL values must be unique
ALTER TABLE users ADD CONSTRAINT users_nrp_unique UNIQUE (nrp);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_nrp ON users(nrp) WHERE nrp IS NOT NULL;