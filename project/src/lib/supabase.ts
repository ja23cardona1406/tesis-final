import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Función para obtener artículos publicados desde Supabase
export const getPublishedArticles = async () => {
  const { data, error } = await supabase
    .from('articles') // Asegúrate de que la tabla se llame "articles"
    .select('*')
    .eq('status', 'published'); // Filtra solo los artículos publicados

  if (error) {
    console.error('Error al obtener artículos:', error);
    return [];
  }

  return data; // Devuelve los artículos obtenidos
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
