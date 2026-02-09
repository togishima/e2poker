export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head />
      <body>{children}</body>
    </html>
  )
}
