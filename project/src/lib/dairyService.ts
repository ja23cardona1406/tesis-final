import { supabase } from './supabase';
import { Cow, DairyRecord } from './types';

// Calculate the total production for active, milking cows
export const calculateTotalProduction = (cows: Cow[]): number => {
  return cows
    .filter(cow => cow.status === 'active' && cow.milking_status)
    .reduce((total, cow) => total + (cow.avg_production || 0), 0);
};

// Fetch all dairy records for a cow
export const fetchDairyRecordsForCow = async (cowId: string, limit = 10): Promise<DairyRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('dairy_records')
      .select('*')
      .eq('cow_id', cowId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data as DairyRecord[] || [];
  } catch (err) {
    console.error('Error fetching dairy records:', err);
    return [];
  }
};

// Update the average production for a cow based on recent records
export const updateCowAverageProduction = async (cowId: string): Promise<number> => {
  try {
    // Get recent production data
    const records = await fetchDairyRecordsForCow(cowId, 5);
    
    if (records.length === 0) return 0;
    
    // Calculate average
    const avg = records.reduce((sum, record) => sum + record.production_liters, 0) / records.length;
    
    // Update the cow's average production
    const { error } = await supabase
      .from('cows')
      .update({ avg_production: avg })
      .eq('id', cowId);
    
    if (error) throw error;
    
    return avg;
  } catch (err) {
    console.error('Error updating cow average production:', err);
    return 0;
  }
};