# E² Poker

チームで見積もりを行うための、ログイン不要のプランニングポーカーです。ルームURLを共有して参加し、投票を一斉に開示できます。

## ローカルでの起動

Node.js 22.12以上とpnpm 10以上を使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

フロントエンドは `http://localhost:5173`、WebSocketサーバーは `ws://localhost:3001` で起動します。

## 検証とビルド

```sh
pnpm test --runInBand
pnpm typecheck
pnpm --filter frontend build
```

フロントエンドの配信ファイルは `frontend/dist/public` に生成されます。

## 構成と設定

- `frontend/`: React + Viteによる画面
- `backend/`: Node.js + wsによるWebSocketサーバー
- `shared/`: メッセージ型とデッキ定義
- `render.yaml`: Renderでの配信設定
- `docs/spec.md`: 仕様

フロントエンドのビルド時に `VITE_WS_URL` を設定すると、接続先を変更できます。未設定時は `ws://localhost:3001` です。バックエンドは `PORT`（既定値3001）、`MAX_CONNECTIONS`（200）、`MAX_ROOM_CONNECTIONS`（30）、`IDLE_TIMEOUT_MS`（1800000）で設定できます。

フロントエンドとバックエンドは同じバージョンの通信プロトコルで配信してください。参加者IDはサーバーが接続ごとに発行するため、再接続時には以前の投票・観客設定は引き継がれません。

## データの取扱い

ルームと投票はサーバーのメモリ上にのみ保持し、全員の切断時に削除します。再起動やデプロイでも失われます。表示名とテーマはブラウザーのlocalStorageに保存します。ホスティング事業者による接続ログ等の処理は別途発生する場合があります。

ルームURLを知っている人は参加できます。機密情報を表示名に入力しないでください。詳細はアプリ内のプライバシーポリシーを参照してください。

## ライセンス

ソースコードは [MIT License](LICENSE) で公開しています。依存パッケージは各パッケージのライセンスに従います。
