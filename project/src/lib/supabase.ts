import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
};

// Get minimal public user info for comments (safe for public use)
export const getCommentUserById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')  // Solo campos públicos para comentarios
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching public user profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getCommentUserById:', err);
    return null;
  }
};

// Get user by ID (full profile, restricted use)
export const getUserById = async (userId: string) => {
  try {
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return userData;
  } catch (err) {
    console.error('Error in getUserById:', err);
    return null;
  }
};

// Get all published articles from Supabase
export const getPublishedArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published');

  if (error) {
    console.error('Error getting articles:', error);
    return [];
  }

  return data;
};

// Get comments with user information (using minimal public user info)
export const getCommentsWithUsers = async (articleId: string) => {
  try {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;
    
    // Process comments and fetch minimal user info for each
    const processedComments = await Promise.all((commentsData || []).map(async (comment) => {
      const userInfo = await getCommentUserById(comment.user_id);
      return {
        id: comment.id,
        article_id: comment.article_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        user: userInfo
      };
    }));

    return processedComments;
  } catch (err) {
    console.error('Error fetching comments with users:', err);
    return [];
  }
};

// Get all cows
export const getCows = async () => {
  const { data, error } = await supabase
    .from('cows')
    .select('id, name, weight_kg, age_months, lactation_days, breed, avg_production, status, created_at, milking_status, exclusion_reason');

  if (error) {
    console.error('Error getting cows:', error);
    return [];
  }
  return data;
};

// Get all dairy records
export const getDairyRecords = async () => {
  const { data, error } = await supabase
    .from('dairy_records')
    .select('id, cow_id, session, production_liters, temperature, humidity, feed_amount, created_at, udder_humidity, weekly_feed_kg');

  if (error) {
    console.error('Error getting dairy records:', error);
    return [];
  }
  return data;
};

// Delete a dairy record
export const deleteDairyRecord = async (recordId: string) => {
  const { error } = await supabase
    .from('dairy_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
  
  return true;
};

// Add a new dairy record
export const addDairyRecord = async (record: {
  cow_id: string;
  production_liters: number;
  temperature: number;
  feed_amount: number;
  udder_humidity: number;
  session: 'Mañana' | 'Tarde';
}) => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not authenticated. Please log in.');
  }

  const { data, error } = await supabase
    .from('dairy_records')
    .insert([{
      ...record,
      user_id: user.id
    }])
    .select();

  if (error) {
    console.error('Error saving record:', error);
    throw error;
  }

  return data?.[0];
};
