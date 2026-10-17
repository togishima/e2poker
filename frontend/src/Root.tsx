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
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="E² Poker" />
        <meta property="og:title" content="E² Poker" />
        <meta
          property="og:description"
          content="登録不要ですぐに始められる、シンプルなプランニングポーカー。URLを共有するだけでチームで見積もりができます。"
        />
        <meta property="og:url" content="https://e2poker.dev/" />
        <meta property="og:image" content="https://e2poker.dev/ogp.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="ja_JP" />
        <meta name="twitter:card" content="summary_large_image" />
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
