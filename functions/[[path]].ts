import type { DurableObjectNamespace, PagesFunction } from '@cloudflare/workers-types';

import { RoomDO } from '../workers/src/room-do';

export { RoomDO };

interface Env {
  ROOM?: DurableObjectNamespace;
  'w-typing-fight-workers_RoomDO'?: DurableObjectNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;

  if (request.headers.get('Upgrade') === 'websocket') {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');
    if (!roomId) {
      return new Response('Missing roomId', { status: 400 });
    }

    console.log('[Pages Function] env keys', Object.keys(env ?? {}));

    const roomNamespace = env.ROOM ?? env['w-typing-fight-workers_RoomDO'];
    if (!roomNamespace) {
      console.error('[Pages Function] ROOM Durable Object binding is missing');
      return new Response('ROOM Durable Object binding missing', { status: 500 });
    }

    try {
      const id = roomNamespace.idFromName(roomId);
      const stub = roomNamespace.get(id);
      console.log('[Pages Function] Forwarding websocket to RoomDO', roomId);

      return await stub.fetch(request);
    } catch (error) {
      console.error('[Pages Function] Failed to forward websocket to RoomDO', error);
      return new Response('Failed to connect to room', { status: 500 });
    }
  }

  return next();
};
