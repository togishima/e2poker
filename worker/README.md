# @e2poker/worker

Cloudflare Workers 版のサーバー。frontend の静的配信と、`/ws?room=<roomId>` の WebSocket（ルームごとに Durable Object）を 1 つの Worker で扱う。

## デプロイ

`main` への push で Workers Builds が自動デプロイする（Root directory: `worker`）。

- Build command: `pnpm install --frozen-lockfile && pnpm --filter @e2poker/frontend build`
- Deploy command: `npx wrangler deploy`

main 以外のブランチは「プレビューのベース」の設定で `npx wrangler preview` が実行される。こちらはリポジトリのルートで実行されるため、`wrangler.jsonc` はリポジトリ直下に置いている（`worker/` から実行しても wrangler は親ディレクトリを遡って見つける）。

- Preview command: `npx wrangler preview`
- `wrangler.jsonc` の `previews` ブロックも必要

## ローカル開発

```sh
pnpm --filter @e2poker/worker dev
```
