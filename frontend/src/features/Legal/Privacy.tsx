export function Privacy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">プライバシーポリシー</h1>
      <p className="mb-4">
        本サービス（E²
        Poker）におけるユーザー情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">第1条（個人情報）</h2>
      <p className="mb-4">「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとします。</p>

      <h2 className="text-xl font-bold mt-6 mb-2">第2条（ルーム内の情報）</h2>
      <p className="mb-4">
        表示名、投票、観客モード等のルーム情報は、サービス提供のためサーバーのメモリ上で処理します。表示名と投票状況は同じルームの参加者に共有され、投票内容は本人および開示後の参加者に表示されます。全員が切断するとルーム情報は削除され、サーバーの再起動等でも失われます。本サービスはこれらの情報をデータベースやファイルに永続保存しません。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">第3条（ブラウザー内の保存）</h2>
      <p className="mb-4">
        表示名とテーマ設定は、再訪時に復元するためブラウザーのlocalStorageに保存します。これらはブラウザーのサイトデータを削除することで消去できます。参加者IDは接続ごとにサーバーが発行し、localStorageには保存しません。ルームURLを知っている人は参加できるため、URLの共有先にはご注意ください。
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">第4条（外部サービス）</h2>
      <p className="mb-4">
        本サービスはGoogle
        Fontsを利用してフォントを読み込みます。その際、接続元IPアドレスやブラウザー情報等がGoogleに送信されます。また、本サービスはCloudflareを利用して配信しており、Cloudflareがアクセスログ（IPアドレス、アクセス日時、閲覧したページ等）を記録します。運営者はこれをアクセス状況の把握のために集計した形で利用します。これらの情報の取扱いは各事業者のポリシーに従います。
      </p>
      <p className="mb-4">
        表示速度の計測のため、CloudflareのWeb
        Analyticsを利用しています。ページを開くとCloudflareのスクリプトが読み込まれ、閲覧したページのURL、参照元、ページの読み込み時間などの表示性能の情報がCloudflareに送信されます。このスクリプトはCookieやローカルストレージを使用しません。現在、本サービスではGoogle
        Analyticsによるアクセス解析を行っていません。
      </p>
      <p className="mb-4">
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Googleのプライバシーポリシー
        </a>
        {' / '}
        <a
          href="https://www.cloudflare.com/ja-jp/privacypolicy/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Cloudflareのプライバシーポリシー
        </a>
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">第5条（お問い合わせ）</h2>
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
    </main>
  )
}
