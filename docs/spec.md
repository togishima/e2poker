E² Poker (Estimate × Ephemeral) 外部設計書
1. プロダクト概要
E² Poker は、エンジニアチームがポインティング（見積もり）を行うための、ログイン不要・ルームデータをサーバーに永続保存しない軽量Webアプリケーションです。

Estimate（見積もり）: チームの合意形成を加速させるツール。

Ephemeral（儚い）: 全員が切断すると、ルームと投票をサーバーのメモリから削除する。表示名とテーマは利用者のブラウザー内に保存する。ホスティング事業者による接続ログ等の取扱いは、プライバシーポリシーを参照。

2. 技術スタック
Frontend: funstack-static (React + Vite)

Backend: Node.js + ws (WebSocketサーバー)

Infrastructure: Render

Frontend: Static Site (無料枠・スリープなし)

Backend: Web Service (無料枠・15分でスリープあり)

Architecture:

Shared Types: フロント/バックで通信型を共有。

Colocation Principle: 技術駆動ではなく機能駆動のディレクトリ構成。

3. 主要要件
3.1 ユーザー・ルーム
認証不要: ログインプロセスなしですぐに利用可能。

ルームID: crypto.randomUUID() によるランダムなUUIDで発行。

参加者ID: サーバーがWebSocket接続ごとに発行し、SYNC_STATEで接続本人へ通知。JOIN時にクライアントから指定することはできない。再接続では新しいIDになる。

URL入室: https://[domain]/room/[UUID] 形式のURLで直接入室。

ユーザー名:

初期値：ランダムな「色 + 動物の名前」を自動付与。

変更：後から自由に変更可能。

永続化：localStorage に保存し、リロード時に復元。

3.2 見積もり機能
対応形式:

フィボナッチ数列 (0, 1, 2, 3, 5, 8, 13, 21, 34, ?, ☕)

ファイブフィンガー (1, 2, 3, 4, 5)

Roman Voting (👍, 👎, ✋)

Tシャツサイズ (XS, S, M, L, XL)

統計計算: フィボナッチとファイブフィンガー時、開示後に「最大」「最小」「平均」を表示。数値以外の値は計算から除外。

観客モード:

チェックボックスで切り替え。

投票権を持たず、統計計算にも含まれない。

3.3 通信・ステート管理
リアルタイム通信: WebSocketによる双方向通信。

ステートレス（サーバー）: データベースを持たず、全データはサーバーのメモリ（RAM）上のみで保持。

揮発性仕様: Renderのスリープやデプロイにより、全ルームデータは定期的にクリアされる（Ephemeralな性質の許容）。

4. UI/UX 仕様
テーマ切り替え: システム設定同期、ダーク、ライトの3モード対応。

カード演出: 全体開示イベント時に、カードが一斉に裏返る3Dアニメーション（CSS transform）。

レイアウト:

テーブル: 最大9名が並んでも崩れない安定したグリッド。場に出るカードは視認性重視で大きめに設定。

デッキ: 下部に配置される選択用カードは、押しやすさを考慮してさらに巨大なUIを採用。

操作ボタン: 「カードを開く（Reveal）」および「リセット」ボタンは、デッキの直上に配置し、操作動線を最適化。

観客設定: ヘッダーのユーザー名横に「観客モード」チェックボックスを配置。

5. ディレクトリ設計（コロケーション原則）
Plaintext
/
├── shared/                 # フロント・バック共通
│   └── protocol.ts         # SocketMessage等の型定義
├── backend/                # Node.jsサーバー
│   ├── index.ts
│   └── room-manager.ts     # メモリ上の状態管理
└── frontend/               # Reactアプリ
    └── src/
        ├── features/
        │   └── PokerRoom/   # 企画ポーカー機能の凝縮
        │       ├── PokerRoom.tsx
        │       ├── PokerRoom.hooks.ts  # WS/LocalStorageロジック
        │       ├── PokerRoom.types.ts
        │       ├── Card.tsx
        │       └── Card.css
        └── App.tsx
6. メッセージプロトコル (概要)
JOIN: ルームIDと表示名を指定して入室。同じ接続での再JOINは拒否。

VOTE: 投票（開示前は値を隠蔽）。

REVEAL: 一斉開示トリガー。

RESET: ラウンドのリセット。

CHANGE_NAME: ユーザー名変更通知。

SYNC_STATE: 各接続へのステート同期と、サーバーが発行した接続本人の参加者IDの通知（サーバーから配信）。
