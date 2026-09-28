import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';

export type MessageChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
};

export function subscribeMessages(
  conversationId: string,
  onChange: (payload: MessageChangePayload) => void,
): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => undefined;
  }

  let channel: RealtimeChannel | null = client
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onChange({
          eventType: payload.eventType as MessageChangePayload['eventType'],
          new: (payload.new as Record<string, unknown> | null) ?? null,
          old: (payload.old as Record<string, unknown> | null) ?? null,
        });
      },
    )
    .subscribe();

  return () => {
    if (channel) {
      void client.removeChannel(channel);
      channel = null;
    }
  };
}
