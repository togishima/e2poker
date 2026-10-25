import { type ChildProcess, spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { createServer } from 'node:net'
import type { ServerMessage } from '@e2poker/shared'
import { WebSocket } from 'ws'

let server: ChildProcess
let url: string
const clients: WebSocket[] = []

beforeAll(async () => {
  const reservation = createServer()
  reservation.listen(0, '127.0.0.1')
  await once(reservation, 'listening')
  const address = reservation.address()
  if (!address || typeof address === 'string') throw new Error('ポートを取得できません')
  const port = address.port
  await new Promise<void>((resolve) => reservation.close(() => resolve()))
  url = `ws://127.0.0.1:${port}`
  server = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise<void>((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => reject(new Error(output || '起動タイムアウト')), 10000)
    server.on('error', reject)
    server.on('exit', () => reject(new Error(output || 'サーバーが終了しました')))
    server.stderr?.on('data', (data) => {
      output += data.toString()
    })
    server.stdout?.on('data', (data) => {
      output += data.toString()
      if (output.includes('backend listening')) {
        clearTimeout(timeout)
        resolve()
      }
    })
  })
}, 15000)

afterEach(async () => {
  await Promise.all(
    clients.splice(0).map(async (ws) => {
      if (ws.readyState === WebSocket.CLOSED) return
      const closed = once(ws, 'close')
      ws.close()
      await closed
    }),
  )
})

afterAll(async () => {
  if (!server || server.exitCode !== null) return
  const exited = once(server, 'exit')
  server.kill('SIGTERM')
  await exited
})

async function connect() {
  const ws = new WebSocket(url)
  clients.push(ws)
  const messages: ServerMessage[] = []
  ws.on('message', (data) => messages.push(JSON.parse(data.toString())))
  await once(ws, 'open')

  function next(predicate: (message: ServerMessage) => boolean): Promise<ServerMessage> {
    const index = messages.findIndex(predicate)
    if (index !== -1) return Promise.resolve(messages.splice(index, 1)[0] as ServerMessage)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.off('message', check)
        reject(new Error('メッセージの受信タイムアウト'))
      }, 3000)
      function check() {
        const index = messages.findIndex(predicate)
        if (index === -1) return
        clearTimeout(timeout)
        ws.off('message', check)
        resolve(messages.splice(index, 1)[0] as ServerMessage)
      }
      ws.on('message', check)
    })
  }

  return {
    ws,
    send: (message: object) => ws.send(JSON.stringify(message)),
    next,
  }
}

test('他人のIDを送っても別の参加者になり、開示前の投票を取得・変更できない', async () => {
  const roomId = randomUUID()
  const victim = await connect()
  victim.send({ type: 'JOIN', roomId, userName: '参加者A' })
  const joined = await victim.next((message) => message.type === 'SYNC_STATE')
  if (joined.type !== 'SYNC_STATE') throw new Error('状態を受信できません')
  const victimId = joined.state.users[0]?.id
  expect(joined.userId).toBe(victimId)

  victim.send({ type: 'VOTE', value: '13' })
  await victim.next(
    (message) =>
      message.type === 'SYNC_STATE' && message.state.users.some((user) => user.vote === '13'),
  )

  const attacker = await connect()
  attacker.send({ type: 'JOIN', roomId, userName: '参加者B', userId: victimId })
  const observed = await attacker.next((message) => message.type === 'SYNC_STATE')
  if (observed.type !== 'SYNC_STATE') throw new Error('状態を受信できません')
  expect(observed.userId).not.toBe(victimId)
  expect(observed.state.users).toHaveLength(2)
  expect(observed.state.users.find((user) => user.id === victimId)?.vote).toBeNull()

  attacker.send({ type: 'VOTE', value: '1', userId: victimId })
  const updated = await victim.next(
    (message) =>
      message.type === 'SYNC_STATE' &&
      message.state.users.some((user) => user.id !== victimId && user.voted),
  )
  if (updated.type !== 'SYNC_STATE') throw new Error('状態を受信できません')
  expect(updated.state.users.find((user) => user.id === victimId)?.vote).toBe('13')
  expect(updated.state.revealed).toBe(false)

  attacker.send({ type: 'REVEAL' })
  const revealed = await victim.next(
    (message) => message.type === 'SYNC_STATE' && message.state.revealed,
  )
  if (revealed.type !== 'SYNC_STATE') throw new Error('状態を受信できません')
  expect(revealed.state.users.map((user) => user.vote).sort()).toEqual(['1', '13'])
})

test('同じ接続での再JOINを拒否し、元の参加者と投票を維持する', async () => {
  const roomId = randomUUID()
  const client = await connect()
  client.send({ type: 'JOIN', roomId, userName: '参加者A' })
  await client.next((message) => message.type === 'SYNC_STATE')
  client.send({ type: 'JOIN', roomId: randomUUID(), userName: '参加者B' })
  const error = await client.next((message) => message.type === 'ERROR')
  expect(error).toEqual({ type: 'ERROR', message: 'Already joined to a room' })
  client.send({ type: 'VOTE', value: '5' })
  const voted = await client.next(
    (message) =>
      message.type === 'SYNC_STATE' && message.state.users.some((user) => user.vote === '5'),
  )
  if (voted.type !== 'SYNC_STATE') throw new Error('状態を受信できません')
  expect(voted.state.roomId).toBe(roomId)
  expect(voted.state.users).toHaveLength(1)
})

test('再接続では新しい参加者IDを発行し、以前の参加者が残らない', async () => {
  const roomId = randomUUID()
  const first = await connect()
  first.send({ type: 'JOIN', roomId, userName: '参加者A' })
  const original = await first.next((message) => message.type === 'SYNC_STATE')
  if (original.type !== 'SYNC_STATE') throw new Error('状態を受信できません')
  const closed = once(first.ws, 'close')
  first.ws.close()
  await closed
  const second = await connect()
  second.send({ type: 'JOIN', roomId, userName: '参加者A' })
  const rejoined = await second.next((message) => message.type === 'SYNC_STATE')
  if (rejoined.type !== 'SYNC_STATE') throw new Error('状態を受信できません')
  expect(rejoined.userId).not.toBe(original.userId)
  expect(rejoined.state.users).toHaveLength(1)
})
