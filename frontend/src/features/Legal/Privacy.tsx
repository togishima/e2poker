export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">プライバシーポリシー</h1>
      <p className="mb-4">
        本サービス（E²
        Poker）におけるユーザー情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">第1条（個人情報）</h2>
      <p className="mb-4">「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとします。</p>

      <h2 className="text-xl font-bold mt-6 mb-2">第2条（情報の収集）</h2>
      <p className="mb-4">本サービスでは、以下の情報を取り扱います。</p>
      <ul className="list-disc list-inside mb-4">
        <li>
          ユーザー識別子（ランダムに生成した文字列），表示名，表示テーマの設定を，ユーザーのブラウザのローカルストレージに保存します。
        </li>
        <li>
          ルームへの参加時に，ユーザー識別子，表示名，ルームID，投票内容を運営者のサーバーへ送信します。表示名と投票内容（カードを開いた後）は同じルームの参加者に表示されます。ユーザー識別子そのものは他の参加者には送信しません。
        </li>
        <li>
          サーバーではこれらの情報を，ルームに参加者がいる間だけ一時的に保持し，参加者が全員退室した時点で破棄します。
        </li>
        <li>
          本サービスはCloudflareを利用して配信しており，Cloudflareがアクセスログ（IPアドレス，アクセス日時，閲覧したページ等）を記録します。運営者はこれをアクセス状況の把握のために集計した形で利用します。本サービスは解析用のCookieを使用しません。
        </li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">第3条（お問い合わせ）</h2>
      <p className="mb-4">
        本ポリシーに関するお問い合わせは，運営者のX（旧Twitter）アカウント（
        <a
          href="https://x.com/ogi_chotdake_se"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          @ogi_chotdake_se
        </a>
        ）までお願いいたします。
      </p>

      <p className="mt-8 text-sm text-gray-500">最終更新日：2026年10月17日</p>
    </div>
  )
}
