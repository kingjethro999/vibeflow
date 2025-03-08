import { supabase } from "../lib/supabase";

export const searchContent = async (query) => {
    try {
        const [userResults, postResults] = await Promise.all([
            supabase
                .from('users')
                .select('id, name, image')
                .ilike('name', `%${query}%`)
                .limit(5),
            
            supabase
                .from('posts')
                .select(`
                    *,
                    user:users(id, name, image),
                    comments(count)
                `)
                .or(`description.ilike.%${query}%`)
                .limit(5)
        ]);

        return {
            success: true,
            data: {
                users: userResults.data || [],
                posts: postResults.data || []
            }
        };
    } catch (error) {
        console.log('Search error:', error);
        return { success: false, msg: 'Could not perform search' };
    }
}