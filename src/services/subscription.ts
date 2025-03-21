import { supabase } from '../lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface SubscriptionOptions {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

type SubscriptionPayload<T> = {
  new: T;
  old: T;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

export const subscriptionService = {
  /**
   * Subscribe to table changes
   * @param channel Channel name for the subscription
   * @param options Options for the subscription
   * @param callback Callback to handle subscription events
   * @returns Function to unsubscribe
   */
  subscribeToChanges<T>(
    channel: string,
    options: SubscriptionOptions,
    callback: (payload: SubscriptionPayload<T>) => void
  ) {
    const { table, schema = 'public', event = '*', filter } = options;
    
    const subscription = supabase
      .channel(channel)
      .on(
        'postgres_changes' as any, // Type cast to bypass type checking
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          callback({
            new: payload.new as T,
            old: payload.old as T,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Subscribe to channel changes for a specific server
   * @param serverId Server ID to subscribe to
   * @param callback Callback to handle subscription events
   * @returns Function to unsubscribe
   */
  subscribeToChannels<T>(
    serverId: string,
    callback: (payload: { new: T; old: T; eventType: string }) => void
  ) {
    return this.subscribeToChanges<T>(
      `channels:${serverId}`,
      {
        table: 'channels',
        filter: `server_id=eq.${serverId}`,
      },
      callback
    );
  },

  /**
   * Subscribe to message changes for a specific channel
   * @param channelId Channel ID to subscribe to
   * @param callback Callback to handle subscription events
   * @returns Function to unsubscribe
   */
  subscribeToMessages<T>(
    channelId: string,
    callback: (payload: { new: T; old: T; eventType: string }) => void
  ) {
    return this.subscribeToChanges<T>(
      `messages:${channelId}`,
      {
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      },
      callback
    );
  },

  /**
   * Subscribe to server changes
   * @param callback Callback to handle subscription events
   * @returns Function to unsubscribe
   */
  subscribeToServers<T>(
    callback: (payload: { new: T; old: T; eventType: string }) => void
  ) {
    return this.subscribeToChanges<T>(
      'servers',
      {
        table: 'servers',
      },
      callback
    );
  },

  /**
   * Subscribe to user profile changes
   * @param callback Callback to handle subscription events
   * @returns Function to unsubscribe
   */
  subscribeToUserChanges<T>(
    callback: (payload: { new: T; old: T; eventType: string }) => void
  ) {
    return this.subscribeToChanges<T>(
      'profile_changes',
      {
        table: 'users',
      },
      callback
    );
  },
}; 