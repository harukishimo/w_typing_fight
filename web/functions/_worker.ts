/**
 * Cloudflare Pages Functions - Advanced Mode
 * WebSocket処理をPages内で実行
 */

import { RoomDO } from '../../workers/src/room-do';

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

      const roomNamespace = env.ROOM ?? env['w-typing-fight-workers_RoomDO'];
      if (!roomNamespace) {
        console.error('[Pages Function] ROOM Durable Object binding is missing');
        return new Response('ROOM Durable Object binding missing', { status: 500 });
      }

      // Get Durable Object instance
      const id = roomNamespace.idFromName(roomId);
      const stub = roomNamespace.get(id);
      console.log('[Pages Function] Forwarding websocket to RoomDO', roomId);

      return stub.fetch(request);
    }

    return new Response('Type Fighter API', { status: 200 });
  },
};

export interface Env {
  ROOM?: DurableObjectNamespace;
  'w-typing-fight-workers_RoomDO'?: DurableObjectNamespace;
}
