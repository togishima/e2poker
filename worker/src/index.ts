import type { RoomObject } from './room'

export { RoomObject } from './room'

export interface Env {
  ASSETS: Fetcher
  ROOMS: DurableObjectNamespace<RoomObject>
}

const MAX_ROOM_ID_LENGTH = 64

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // SPA の静的配信。/ws 以外はすべて Static Assets に任せる
    if (url.pathname !== '/ws') {
      return env.ASSETS.fetch(request)
    }

    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 })
    }

    const room = url.searchParams.get('room')
    if (!room || room.length > MAX_ROOM_ID_LENGTH) {
      return new Response('Invalid room', { status: 400 })
    }

    const stub = env.ROOMS.get(env.ROOMS.idFromName(room))
    return stub.fetch(request)
  },
} satisfies ExportedHandler<Env>
