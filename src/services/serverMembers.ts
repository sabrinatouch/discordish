import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase';

export interface ServerMember {
  user_id: string;
  role: string;
}

export const serverMemberService = {
  async getServerMembers(serverId: string): Promise<ServerMember[]> {
    try {
      const { data, error } = await supabase
        .from('server_members')
        .select('user_id, role')
        .eq('server_id', serverId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },
}; 