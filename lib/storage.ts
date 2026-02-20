/**
 * Storage Layer - Supabase Implementation
 *
 * This module handles all database operations for weekly metrics.
 * Uses Supabase PostgreSQL for persistent storage.
 */

import { supabase } from './supabase';
import { WeeklyMetrics } from './types';

const TABLE_NAME = 'weekly_metrics';

function validateSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables. Please check your configuration.');
  }
}

export async function getAllMetrics(): Promise<WeeklyMetrics[]> {
  validateSupabase();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('week_start_date', { ascending: true });

  if (error) {
    console.error('Error fetching metrics:', error);
    throw new Error(`Failed to fetch metrics: ${error.message}`);
  }

  // Transform snake_case from database to camelCase for app
  return (data || []).map(transformFromDb);
}

export async function getMetricById(id: string): Promise<WeeklyMetrics | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching metric:', error);
    throw new Error(`Failed to fetch metric: ${error.message}`);
  }

  return data ? transformFromDb(data) : null;
}

export async function createMetric(
  metric: Omit<WeeklyMetrics, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WeeklyMetrics> {
  const dbMetric = {
    week_start_date: metric.weekStartDate,
    week_end_date: metric.weekEndDate,
    website_visitors: metric.websiteVisitors,
    waitlist_signups: metric.waitlistSignups,
    conversion_rate: metric.conversionRate,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([dbMetric])
    .select()
    .single();

  if (error) {
    console.error('Error creating metric:', error);
    throw new Error(`Failed to create metric: ${error.message}`);
  }

  return transformFromDb(data);
}

export async function updateMetric(
  id: string,
  updates: Partial<Omit<WeeklyMetrics, 'id' | 'createdAt'>>
): Promise<WeeklyMetrics | null> {
  // Transform camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {};

  if (updates.weekStartDate !== undefined) dbUpdates.week_start_date = updates.weekStartDate;
  if (updates.weekEndDate !== undefined) dbUpdates.week_end_date = updates.weekEndDate;
  if (updates.websiteVisitors !== undefined) dbUpdates.website_visitors = updates.websiteVisitors;
  if (updates.waitlistSignups !== undefined) dbUpdates.waitlist_signups = updates.waitlistSignups;
  if (updates.conversionRate !== undefined) dbUpdates.conversion_rate = updates.conversionRate;

  // Recalculate conversion rate if needed
  if (updates.websiteVisitors !== undefined || updates.waitlistSignups !== undefined) {
    const current = await getMetricById(id);
    if (current) {
      const visitors = updates.websiteVisitors ?? current.websiteVisitors;
      const signups = updates.waitlistSignups ?? current.waitlistSignups;
      dbUpdates.conversion_rate = visitors === 0 ? 0 : Number(((signups / visitors) * 100).toFixed(2));
    }
  }

  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error updating metric:', error);
    throw new Error(`Failed to update metric: ${error.message}`);
  }

  return data ? transformFromDb(data) : null;
}

export async function deleteMetric(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting metric:', error);
    return false;
  }

  return true;
}

/**
 * Transform database row (snake_case) to app format (camelCase)
 */
function transformFromDb(row: any): WeeklyMetrics {
  return {
    id: row.id,
    weekStartDate: row.week_start_date,
    weekEndDate: row.week_end_date,
    websiteVisitors: row.website_visitors,
    waitlistSignups: row.waitlist_signups,
    conversionRate: row.conversion_rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
