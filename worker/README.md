# @e2poker/worker

Cloudflare Workers 版のサーバー。frontend の静的配信と、`/ws?room=<roomId>` の WebSocket（ルームごとに Durable Object）を 1 つの Worker で扱う。

## デプロイ

`main` への push で Workers Builds が自動デプロイする（Root directory: `worker`）。

- Build command: `pnpm install --frozen-lockfile && pnpm --filter @e2poker/frontend build`
- Deploy command: `npx wrangler deploy`

Build variables に `VITE_WS_URL` を設定しないこと。設定すると frontend が Render の backend に接続してしまう。

## ローカル開発

```sh
pnpm --filter @e2poker/worker dev
```
