'use client'
import 'urlpattern-polyfill'
import './index.css'
import { Router, route } from '@funstack/router'
import { Home } from './features/Home/Home'
import { PokerRoom } from './features/PokerRoom/PokerRoom'
import { Terms } from './features/Legal/Terms'
import { Privacy } from './features/Legal/Privacy'

const routes = [
  route({ path: '/', component: Home }),
  route({ path: '/room/:roomId', component: PokerRoom }),
  route({ path: '/terms', component: Terms }),
  route({ path: '/privacy', component: Privacy }),
]

export default function App() {
  return <Router routes={routes} fallback="static" />
}
