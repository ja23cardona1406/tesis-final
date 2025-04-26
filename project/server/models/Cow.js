import { supabase } from '../config/supabaseClient.js';

export const Cow = {
  async getAll() {
    const { data, error } = await supabase.from('cow').select('*');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from('cow').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(cowData) {
    const { data, error } = await supabase.from('cow').insert([cowData]);
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('cow').update(updates).eq('id', id);
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase.from('cow').delete().eq('id', id);
    if (error) throw error;
    return data;
  }
};
