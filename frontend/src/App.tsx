'use client'
import { Router, route } from '@funstack/router'
import { Home } from './features/Home/Home'
import { PokerRoom } from './features/PokerRoom/PokerRoom'

const routes = [
  route({ path: '/', component: Home }),
  route({ path: '/room/:roomId', component: PokerRoom }),
]

export default function App() {
  return <Router routes={routes} fallback="static" />
}
