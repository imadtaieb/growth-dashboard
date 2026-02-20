-- Growth Dashboard Database Schema
--
-- This file contains the database schema for the Growth Dashboard.
-- Run this SQL in your Supabase SQL Editor to create the table.

-- Create the weekly_metrics table
CREATE TABLE IF NOT EXISTS weekly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  website_visitors INTEGER NOT NULL DEFAULT 0,
  waitlist_signups INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on week_start_date for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_metrics_week_start
ON weekly_metrics(week_start_date);

-- Create a unique constraint to prevent duplicate weeks
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_metrics_unique_week
ON weekly_metrics(week_start_date, week_end_date);

-- Enable Row Level Security (RLS)
ALTER TABLE weekly_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now
-- (In production, you might want to restrict this to authenticated users)
CREATE POLICY "Enable all access for weekly_metrics"
ON weekly_metrics
FOR ALL
USING (true)
WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_weekly_metrics_updated_at
  BEFORE UPDATE ON weekly_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add a comment to the table
COMMENT ON TABLE weekly_metrics IS 'Stores weekly growth metrics for the dashboard';
