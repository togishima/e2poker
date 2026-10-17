'use client'
import 'urlpattern-polyfill'
import './index.css'
import { Router, route } from '@funstack/router'
import { Home } from './features/Home/Home'
import { Privacy } from './features/Legal/Privacy'
import { Terms } from './features/Legal/Terms'
import { PokerRoom } from './features/PokerRoom/PokerRoom'

// Render 版は e2poker.dev へ移転したので、同じパス・クエリのまま転送する
const redirectOrigin = import.meta.env.VITE_REDIRECT_ORIGIN
if (redirectOrigin && typeof window !== 'undefined') {
  window.location.replace(
    `${redirectOrigin}${window.location.pathname}${window.location.search}${window.location.hash}`,
  )
}

const routes = [
  route({ path: '/', component: Home }),
  route({ path: '/room/:roomId', component: PokerRoom }),
  route({ path: '/terms', component: Terms }),
  route({ path: '/privacy', component: Privacy }),
]

export default function App() {
  return <Router routes={routes} fallback="static" />
}
