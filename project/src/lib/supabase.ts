import { createClient } from '@supabase/supabase-js';

// Interface definitions for Supabase client
interface SupabaseClient {
  from: (table: string) => TableQueryBuilder;
}

interface TableQueryBuilder {
  select: (columns?: string) => TableQueryBuilder;
  insert: (data: any[]) => Promise<{ data: any | null; error: Error | null }>;
  update: (data: object) => TableFilterBuilder;
  delete: () => TableFilterBuilder;
  eq: (column: string, value: any) => TableQueryBuilder;
  order: (column: string, options?: { ascending: boolean }) => TableQueryBuilder;
  limit: (count: number) => TableQueryBuilder;
  single: () => Promise<{ data: any | null; error: Error | null }>;
}

interface TableFilterBuilder {
  eq: (column: string, value: any) => Promise<{ data: any | null; error: Error | null }>;
}

// Mock implementation for development or testing
class MockSupabaseClient implements SupabaseClient {
  from(table: string): TableQueryBuilder {
    return new MockTableQueryBuilder(table);
  }
}

class MockTableQueryBuilder implements TableQueryBuilder {
  private table: string;
  private selectedColumns: string | undefined;
  private filters: { column: string; value: any }[] = [];
  private orderByColumn: string | undefined;
  private orderByAsc: boolean = true;
  private limitCount: number | undefined;
  private singleResult: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string): TableQueryBuilder {
    this.selectedColumns = columns;
    return this;
  }

  async insert(data: any[]): Promise<{ data: any | null; error: Error | null }> {
    console.log(`[Mock Supabase] Inserting into ${this.table}:`, data);
    return { data, error: null };
  }

  update(data: object): TableFilterBuilder {
    return {
      eq: async (column: string, value: any) => {
        console.log(`[Mock Supabase] Updating ${this.table} where ${column} = ${value}:`, data);
        return { data: null, error: null };
      }
    };
  }

  delete(): TableFilterBuilder {
    return {
      eq: async (column: string, value: any) => {
        console.log(`[Mock Supabase] Deleting from ${this.table} where ${column} = ${value}`);
        return { data: null, error: null };
      }
    };
  }

  eq(column: string, value: any): TableQueryBuilder {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending: boolean }): TableQueryBuilder {
    this.orderByColumn = column;
    this.orderByAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number): TableQueryBuilder {
    this.limitCount = count;
    return this;
  }

  single(): Promise<{ data: any | null; error: Error | null }> {
    this.singleResult = true;
    return this.executeQuery();
  }

  private async executeQuery(): Promise<{ data: any | null; error: Error | null }> {
    console.log(`[Mock Supabase] Querying ${this.table} with:`, {
      columns: this.selectedColumns,
      filters: this.filters,
      orderBy: this.orderByColumn,
      orderDirection: this.orderByAsc ? 'ascending' : 'descending',
      limit: this.limitCount,
      singleResult: this.singleResult
    });
    
    // Return empty data with no error
    return { data: null, error: null };
  }
}

// Determine whether to use real or mock Supabase client
let supabase: any;

try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    // Use real Supabase client if environment variables are available
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Using real Supabase client');
  } else {
    // Use mock client if environment variables are not available
    supabase = new MockSupabaseClient();
    console.log('Using mock Supabase client');
  }
} catch (error) {
  // Fallback to mock client if any error occurs
  supabase = new MockSupabaseClient();
  console.log('Error initializing Supabase, using mock client:', error);
}

export { supabase };

// Helper functions to interact with Supabase

// ✅ Función para obtener artículos publicados desde Supabase
export const getPublishedArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published');

  if (error) {
    console.error('Error al obtener artículos:', error);
    return [];
  }

  return data;
};

// ✅ Obtener todas las vacas
export const getCows = async () => {
  const { data, error } = await supabase
    .from('cows')
    .select('id, name, weight_kg, age_months, lactation_days, breed, avg_production, status, created_at, milking_status, exclusion_reason');

  if (error) {
    console.error('Error al obtener vacas:', error);
    return [];
  }
  return data;
};

// ✅ Obtener todos los registros de ordeño
export const getDairyRecords = async () => {
  const { data, error } = await supabase
    .from('dairy_records')
    .select('id, cow_id, session, production_liters, temperature, humidity, feed_amount, created_at, udder_humidity, weekly_feed_kg');

  if (error) {
    console.error('Error al obtener registros de ordeño:', error);
    return [];
  }
  return data;
};