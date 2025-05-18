import { supabase } from './supabase';
import { Comment, User } from './types';

/**
 * Fetch comments for a specific article
 * @param articleId - The ID of the article
 * @returns Promise with array of comments
 */
export async function getComments(articleId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        article_id,
        user_id,
        content,
        created_at,
        user:user_id (id, email)
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transformar los datos para asegurar que 'user' sea de tipo User | null
    const transformedData = data?.map(item => ({
      ...item,
      user: Array.isArray(item.user) && item.user.length > 0 ? item.user[0] : null
    })) || [];

    return transformedData as Comment[];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * Add a new comment to an article
 * @param comment - Comment data
 * @returns Promise with the created comment
 */
export async function addComment(comment: {
  article_id: string;
  user_id: string;
  content: string;
}): Promise<Comment> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 * @param commentId - ID of the comment to delete
 * @param userId - ID of the user attempting to delete (for authorization)
 * @returns Promise indicating success
 */
export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  try {
    // First check if the user is authorized to delete this comment
    const { data: commentData, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    
    // Only allow deletion if the user owns the comment
    if (commentData.user_id !== userId) {
      throw new Error('No tienes permiso para eliminar este comentario');
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Get user information for a comment
 * @param userId - ID of the user
 * @returns Promise with user data
 */
export async function getUserForComment(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error('Error fetching user for comment:', error);
    return null;
  }
}