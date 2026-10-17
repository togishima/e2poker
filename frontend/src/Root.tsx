export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>E² Poker</title>
        <meta
          name="description"
          content="登録不要ですぐに始められる、シンプルなプランニングポーカー。URLを共有するだけでチームで見積もりができます。"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
