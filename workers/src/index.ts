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

      // Get Durable Object instance
      const id = env.ROOM.idFromName(roomId);
      const stub = env.ROOM.get(id);
      console.log('[Worker] Forwarding websocket to RoomDO', roomId);

      return stub.fetch(request);
    }

    return new Response('Type Fighter Workers API', { status: 200 });
  },
};

export interface Env {
  ROOM: DurableObjectNamespace;
}
