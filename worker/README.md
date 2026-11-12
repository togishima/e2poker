# @e2poker/worker

Cloudflare Workers 版のサーバー。frontend の静的配信と、`/ws?room=<roomId>` の WebSocket（ルームごとに Durable Object）を 1 つの Worker で扱う。

## デプロイ

`main` への push で Workers Builds が自動デプロイする（Root directory: `worker`）。

- Build command: `pnpm install --frozen-lockfile && pnpm --filter @e2poker/frontend build`
- Deploy command: `npx wrangler deploy`
- Preview command（main 以外のブランチ）: `npx wrangler preview -c worker/wrangler.jsonc`
  - ビルドはリポジトリのルートで実行されるので、`-c` で設定ファイルを指定する。`wrangler.jsonc` の `previews` ブロックも必要

## ローカル開発

```sh
pnpm --filter @e2poker/worker dev
```
