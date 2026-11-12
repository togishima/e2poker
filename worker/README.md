# @e2poker/worker

Cloudflare Workers 版のサーバー。frontend の静的配信と、`/ws?room=<roomId>` の WebSocket（ルームごとに Durable Object）を 1 つの Worker で扱う。

## デプロイ

`main` への push で Workers Builds が自動デプロイする（Root directory: `worker`）。

- Build command: `pnpm install --frozen-lockfile && pnpm --filter @e2poker/frontend build`
- Deploy command: `npx wrangler deploy`

main 以外のブランチは「プレビューのベース」の設定でビルドされる。Root directory は本番と同じく `worker` にしておく（`/` だと `wrangler.jsonc` が見つからず失敗する）。

- Preview command: `npx wrangler preview`
- `wrangler.jsonc` の `previews` ブロックも必要
- ダッシュボードの設定を変えた後は、失敗したビルドを再試行しても古い設定のまま実行される。新しく push して確かめる

## ローカル開発

```sh
pnpm --filter @e2poker/worker dev
```
