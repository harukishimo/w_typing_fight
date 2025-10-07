/**
 * Cloudflare Workers Entry Point
 */

import { RoomDO } from './room-do';

export { RoomDO };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const roomId = url.searchParams.get('roomId');
      if (!roomId) {
        return new Response('Missing roomId', { status: 400 });
      }

      console.log('[Worker] env keys', Object.keys(env ?? {}));

      const roomNamespace = env.ROOM ?? env['w-typing-fight-workers_RoomDO'];
      if (!roomNamespace) {
        console.error('[Worker] ROOM Durable Object binding is missing');
        return new Response('ROOM Durable Object binding missing', { status: 500 });
      }

      // Get Durable Object instance
      const id = roomNamespace.idFromName(roomId);
      const stub = roomNamespace.get(id);
      console.log('[Worker] Forwarding websocket to RoomDO', roomId);

      return stub.fetch(request);
    }

    return new Response('Type Fighter Workers API', { status: 200 });
  },
};

export interface Env {
  ROOM?: DurableObjectNamespace;
  'w-typing-fight-workers_RoomDO'?: DurableObjectNamespace;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
}
