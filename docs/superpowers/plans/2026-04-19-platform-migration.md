# 짱하의 놀이터 플랫폼 마이그레이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 게임 앱(도망자)을 멀티게임 플랫폼(짱하의 놀이터)으로 확장 — 게임 선택 홈 화면 + 라우팅 추가, 기존 도망자 코드를 `src/games/runner/`로 이동

**Architecture:** react-router-dom v6으로 `/` (게임 선택) → `/games/:gameId` (게임) 라우팅 구성. 기존 Runner 코드는 `src/games/runner/`로, Firebase 초기화는 `src/shared/firebase/`로 이동. 게임 추가는 `registry.ts` 한 파일만 수정하면 홈 카드·라우트에 자동 반영.

**Tech Stack:** React 18 + TypeScript + Vite + react-router-dom v6 + Firebase Realtime Database + GitHub Pages

---

## 파일 변경 맵

### 이동 (git mv)
| 원래 경로 | 새 경로 |
|---|---|
| `src/components/*` | `src/games/runner/components/*` |
| `src/screens/*` | `src/games/runner/screens/*` |
| `src/hooks/useRoom.ts` | `src/shared/hooks/useRoom.ts` |
| `src/types/game.ts` | `src/games/runner/types/game.ts` |
| `src/utils/*` | `src/games/runner/utils/*` |
| `src/firebase/config.ts` | `src/shared/firebase/config.ts` |
| `src/firebase/roomDb.ts` | `src/shared/firebase/roomDb.ts` |

### 수정 (import 경로 + DB 경로)
| 파일 | 변경 내용 |
|---|---|
| `src/shared/firebase/roomDb.ts` | import 경로 3개 + DB 경로 `rooms/` → `rooms/runner/` |
| `src/shared/hooks/useRoom.ts` | import 경로 1개 |
| `src/games/runner/screens/HomeScreen.tsx` | import 경로 1개 |
| `src/games/runner/screens/GameScreen.tsx` | import 경로 1개 |

### 신규 생성
| 파일 | 설명 |
|---|---|
| `src/games/runner/RunnerApp.tsx` | 기존 App.tsx 내용 이동 + import 경로 수정 |
| `src/games/registry.ts` | 게임 목록 단일 관리 |
| `src/screens/PlaygroundHome/index.tsx` | 게임 선택 홈 화면 |
| `src/screens/PlaygroundHome/index.module.css` | 홈 화면 스타일 |
| `public/404.html` | GitHub Pages SPA 라우팅 리다이렉트 |

### 교체
| 파일 | 변경 내용 |
|---|---|
| `src/App.tsx` | 라우터로 전면 교체 |
| `index.html` | 타이틀 변경 + SPA 리다이렉트 스크립트 삽입 |

---

## Task 1: react-router-dom 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 패키지 설치**

```bash
cd /Users/user/Runner
npm install react-router-dom
```

Expected: `package.json`의 `dependencies`에 `"react-router-dom": "^7.x.x"` 추가됨

- [ ] **Step 2: 타입 확인 (react-router-dom v6+는 타입 내장)**

```bash
node -e "require('./node_modules/react-router-dom/package.json')" && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore: react-router-dom 설치"
```

---

## Task 2: 디렉토리 구조 생성 및 파일 이동

**Files:**
- Create dirs: `src/games/runner/`, `src/shared/firebase/`, `src/shared/hooks/`, `src/screens/PlaygroundHome/`
- Move: 위 파일 변경 맵의 "이동" 항목 전체

- [ ] **Step 1: 디렉토리 생성**

```bash
mkdir -p src/games/runner/components
mkdir -p src/games/runner/screens
mkdir -p src/games/runner/hooks
mkdir -p src/games/runner/utils
mkdir -p src/games/runner/types
mkdir -p src/shared/firebase
mkdir -p src/shared/hooks
mkdir -p src/screens/PlaygroundHome
```

- [ ] **Step 2: components 이동**

```bash
cd /Users/user/Runner
git mv src/components/ActionPanel.tsx src/games/runner/components/ActionPanel.tsx
git mv src/components/ActionPanel.module.css src/games/runner/components/ActionPanel.module.css
git mv src/components/CardPiles.tsx src/games/runner/components/CardPiles.tsx
git mv src/components/CardPiles.module.css src/games/runner/components/CardPiles.module.css
git mv src/components/CardTrail.tsx src/games/runner/components/CardTrail.tsx
git mv src/components/CardTrail.module.css src/games/runner/components/CardTrail.module.css
git mv src/components/ChaserBoard.tsx src/games/runner/components/ChaserBoard.tsx
git mv src/components/ChaserBoard.module.css src/games/runner/components/ChaserBoard.module.css
git mv src/components/HandCards.tsx src/games/runner/components/HandCards.tsx
git mv src/components/HandCards.module.css src/games/runner/components/HandCards.module.css
git mv src/components/TurnBanner.tsx src/games/runner/components/TurnBanner.tsx
git mv src/components/TurnBanner.module.css src/games/runner/components/TurnBanner.module.css
```

- [ ] **Step 3: screens 이동**

```bash
git mv src/screens/HomeScreen.tsx src/games/runner/screens/HomeScreen.tsx
git mv src/screens/HomeScreen.module.css src/games/runner/screens/HomeScreen.module.css
git mv src/screens/LobbyScreen.tsx src/games/runner/screens/LobbyScreen.tsx
git mv src/screens/LobbyScreen.module.css src/games/runner/screens/LobbyScreen.module.css
git mv src/screens/GameScreen.tsx src/games/runner/screens/GameScreen.tsx
git mv src/screens/GameScreen.module.css src/games/runner/screens/GameScreen.module.css
git mv src/screens/ResultScreen.tsx src/games/runner/screens/ResultScreen.tsx
git mv src/screens/ResultScreen.module.css src/games/runner/screens/ResultScreen.module.css
```

- [ ] **Step 4: utils, types, hooks, firebase 이동**

```bash
git mv src/utils/cards.ts src/games/runner/utils/cards.ts
git mv src/utils/cards.test.ts src/games/runner/utils/cards.test.ts
git mv src/utils/highlight.ts src/games/runner/utils/highlight.ts
git mv src/utils/highlight.test.ts src/games/runner/utils/highlight.test.ts
git mv src/utils/validation.ts src/games/runner/utils/validation.ts
git mv src/utils/validation.test.ts src/games/runner/utils/validation.test.ts
git mv src/utils/winCondition.ts src/games/runner/utils/winCondition.ts
git mv src/utils/winCondition.test.ts src/games/runner/utils/winCondition.test.ts
git mv src/types/game.ts src/games/runner/types/game.ts
git mv src/hooks/useRoom.ts src/shared/hooks/useRoom.ts
git mv src/firebase/config.ts src/shared/firebase/config.ts
git mv src/firebase/roomDb.ts src/shared/firebase/roomDb.ts
```

- [ ] **Step 5: 빈 디렉토리 정리**

```bash
rmdir src/components src/screens src/utils src/types src/hooks src/firebase 2>/dev/null || true
```

- [ ] **Step 6: 커밋 (이동만 — 내용 변경 없음)**

```bash
cd /Users/user/Runner
git add -A
git commit -m "refactor: 디렉토리 구조 재편 (games/runner, shared 분리)"
```

---

## Task 3: import 경로 수정 — shared/firebase/roomDb.ts

**Files:**
- Modify: `src/shared/firebase/roomDb.ts`

roomDb.ts는 두 가지 변경이 필요하다:
1. import 경로 3개 수정
2. DB 경로 `rooms/${roomId}` → `rooms/runner/${roomId}` (모든 함수)

- [ ] **Step 1: import 경로 수정**

`src/shared/firebase/roomDb.ts` 파일 상단을 다음으로 교체:

```typescript
import { ref, set, get, update, onValue, off } from 'firebase/database'
import { db } from './config'
import type { GameRoom, Pile, TrailCard } from '../../games/runner/types/game'
import {
  initializeGameCards,
  createStartingTrail,
  createInitialChaserBoard,
  generateRoomId,
} from '../../games/runner/utils/cards'
import { checkWinner } from '../../games/runner/utils/winCondition'
```

- [ ] **Step 2: DB 경로 일괄 치환**

파일 내 모든 `` `rooms/${roomId}` `` → `` `rooms/runner/${roomId}` `` 로 변경.

확인:
```bash
grep -n "rooms/" /Users/user/Runner/src/shared/firebase/roomDb.ts
```

Expected: 모든 경로가 `rooms/runner/` 로 시작함.

- [ ] **Step 3: 테스트 실행**

```bash
cd /Users/user/Runner && npm test
```

Expected: 테스트 전부 PASS (utils 테스트만 있음)

- [ ] **Step 4: 커밋**

```bash
git add src/shared/firebase/roomDb.ts
git commit -m "refactor: roomDb import 경로 수정 + Firebase DB 경로 runner/ 분리"
```

---

## Task 4: import 경로 수정 — shared/hooks/useRoom.ts

**Files:**
- Modify: `src/shared/hooks/useRoom.ts`

- [ ] **Step 1: import 경로 수정**

`src/shared/hooks/useRoom.ts` 전체 교체:

```typescript
import { useState, useEffect } from 'react'
import { subscribeRoom } from '../firebase/roomDb'
import type { GameRoom } from '../../games/runner/types/game'

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeRoom(roomId, data => {
      setRoom(data)
      setLoading(false)
    })
    return unsubscribe
  }, [roomId])

  return { room, loading }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/shared/hooks/useRoom.ts
git commit -m "refactor: useRoom import 경로 수정"
```

---

## Task 5: import 경로 수정 — runner screens

**Files:**
- Modify: `src/games/runner/screens/HomeScreen.tsx`
- Modify: `src/games/runner/screens/GameScreen.tsx`

HomeScreen은 `../firebase/roomDb` → `../../../shared/firebase/roomDb` 변경 필요.
GameScreen도 동일한 경로 변경 필요.

- [ ] **Step 1: HomeScreen.tsx import 수정**

`src/games/runner/screens/HomeScreen.tsx` 상단에서:

```typescript
import { createRoom, joinRoom } from '../firebase/roomDb'
```
를 다음으로 교체:
```typescript
import { createRoom, joinRoom } from '../../../shared/firebase/roomDb'
```

- [ ] **Step 2: GameScreen.tsx import 수정**

`src/games/runner/screens/GameScreen.tsx` 에서 roomDb import 줄 (`import {` 로 시작하는 멀티라인 import)를 찾아 경로를 `'../../../shared/firebase/roomDb'`로 수정.

기존:
```typescript
import {
  drawCard,
  placeCard,
  passTurn,
  endRunnerTurn,
  endChaserTurn,
  toggleGuess,
  submitGuess,
  clearGuessAttempt,
} from '../firebase/roomDb'
```

교체:
```typescript
import {
  drawCard,
  placeCard,
  passTurn,
  endRunnerTurn,
  endChaserTurn,
  toggleGuess,
  submitGuess,
  clearGuessAttempt,
} from '../../../shared/firebase/roomDb'
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/user/Runner && npm run build 2>&1 | tail -20
```

Expected: 에러 없음 (경고는 무시)

- [ ] **Step 4: 커밋**

```bash
git add src/games/runner/screens/HomeScreen.tsx src/games/runner/screens/GameScreen.tsx
git commit -m "refactor: runner screens import 경로 수정"
```

---

## Task 6: RunnerApp.tsx 생성

**Files:**
- Create: `src/games/runner/RunnerApp.tsx`
- Modify: `src/App.tsx` (기존 내용 삭제 후 라우터로 교체 — Task 7에서)

기존 `src/App.tsx`의 내용을 `RunnerApp.tsx`로 이동하되, import 경로를 새 위치에 맞게 수정한다.

- [ ] **Step 1: RunnerApp.tsx 작성**

`src/games/runner/RunnerApp.tsx` 신규 생성:

```typescript
import { useState } from 'react'
import { useRoom } from '../../shared/hooks/useRoom'
import type { Role } from './types/game'
import { rematchRoom } from '../../shared/firebase/roomDb'
import HomeScreen from './screens/HomeScreen'
import LobbyScreen from './screens/LobbyScreen'
import GameScreen from './screens/GameScreen'
import ResultScreen from './screens/ResultScreen'

interface Session {
  roomId: string
  myRole: Role
  myName: string
}

export default function RunnerApp() {
  const [session, setSession] = useState<Session | null>(null)
  const { room, loading } = useRoom(session?.roomId ?? null)

  const handleEnterRoom = (roomId: string, myRole: Role, myName: string) => {
    setSession({ roomId, myRole, myName })
  }

  const handlePlayAgain = () => {
    setSession(null)
  }

  const handleRematch = async (swapRoles = false) => {
    if (!session) return
    await rematchRoom(session.roomId, swapRoles)
    if (swapRoles) {
      setSession(prev => prev ? { ...prev, myRole: prev.myRole === 'runner' ? 'chaser' : 'runner' } : null)
    }
  }

  if (!session) {
    return <HomeScreen onEnterRoom={handleEnterRoom} />
  }

  if (loading || !room) {
    return (
      <div style={{ color: 'var(--color-text-muted)', padding: 24, textAlign: 'center' }}>
        연결 중...
      </div>
    )
  }

  if (room.status === 'finished' && room.winner) {
    return (
      <ResultScreen
        winner={room.winner}
        myRole={session.myRole}
        runnerName={room.players.runner?.name ?? '도망자'}
        chaserName={room.players.chaser?.name ?? '추격자'}
        trail={room.trail}
        onPlayAgain={handlePlayAgain}
        onRematch={() => handleRematch(false)}
        onRematchSwap={() => handleRematch(true)}
      />
    )
  }

  if (room.status === 'playing') {
    return (
      <GameScreen
        room={room}
        roomId={session.roomId}
        myRole={session.myRole}
      />
    )
  }

  return (
    <LobbyScreen
      room={room}
      roomId={session.roomId}
      myRole={session.myRole}
    />
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/games/runner/RunnerApp.tsx
git commit -m "feat: RunnerApp 분리 (games/runner 진입점)"
```

---

## Task 7: registry.ts + App.tsx 라우터 교체

**Files:**
- Create: `src/games/registry.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: registry.ts 작성**

`src/games/registry.ts` 신규 생성:

```typescript
import { lazy } from 'react'
import type { ComponentType } from 'react'

export interface GameEntry {
  id: string
  name: string
  emoji: string
  players: string
  component: ComponentType
}

export const GAMES: GameEntry[] = [
  {
    id: 'runner',
    name: '도망자',
    emoji: '🎲',
    players: '1대1',
    component: lazy(() => import('./runner/RunnerApp')),
  },
]
```

- [ ] **Step 2: App.tsx 라우터로 교체**

`src/App.tsx` 전체 교체:

```typescript
import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { GAMES } from './games/registry'

export default function App() {
  return (
    <BrowserRouter basename="/JJangNol">
      <Suspense fallback={<div style={{ color: 'var(--color-text-muted)', padding: 24, textAlign: 'center' }}>로딩 중...</div>}>
        <Routes>
          <Route path="/" element={<PlaygroundHome />} />
          {GAMES.map(game => (
            <Route
              key={game.id}
              path={`/games/${game.id}/*`}
              element={<game.component />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function PlaygroundHome() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <h1 style={{ color: 'var(--color-gold)', fontFamily: 'serif', marginBottom: 32 }}>짱하의 놀이터</h1>
      <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 400 }}>
        {GAMES.map(game => (
          <Link
            key={game.id}
            to={`/games/${game.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}>
              <span style={{ fontSize: 32 }}>{game.emoji}</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 18 }}>{game.name}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{game.players}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/user/Runner && npm run build 2>&1 | tail -20
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/games/registry.ts src/App.tsx
git commit -m "feat: 게임 레지스트리 + 라우터 기반 App 교체"
```

---

## Task 8: PlaygroundHome 컴포넌트 분리

**Files:**
- Create: `src/screens/PlaygroundHome/index.tsx`
- Create: `src/screens/PlaygroundHome/index.module.css`
- Modify: `src/App.tsx`

Task 7의 App.tsx 인라인 PlaygroundHome 함수를 별도 파일로 분리하고 CSS Modules로 스타일링한다.

- [ ] **Step 1: CSS 파일 작성**

`src/screens/PlaygroundHome/index.module.css` 신규 생성:

```css
.container {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.title {
  color: var(--color-gold);
  font-family: 'Noto Serif KR', serif;
  font-size: 2rem;
  margin-bottom: 32px;
  letter-spacing: 0.05em;
}

.grid {
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s;
}

.card:hover {
  border-color: var(--color-gold);
}

.emoji {
  font-size: 2rem;
  line-height: 1;
}

.gameName {
  font-weight: bold;
  font-size: 1.1rem;
}

.players {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-top: 2px;
}
```

- [ ] **Step 2: 컴포넌트 파일 작성**

`src/screens/PlaygroundHome/index.tsx` 신규 생성:

```typescript
import { Link } from 'react-router-dom'
import { GAMES } from '../../games/registry'
import styles from './index.module.css'

export default function PlaygroundHome() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>짱하의 놀이터</h1>
      <div className={styles.grid}>
        {GAMES.map(game => (
          <Link key={game.id} to={`/games/${game.id}`} className={styles.card}>
            <span className={styles.emoji}>{game.emoji}</span>
            <div>
              <div className={styles.gameName}>{game.name}</div>
              <div className={styles.players}>{game.players}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: App.tsx에서 PlaygroundHome 인라인 함수 제거, 분리된 컴포넌트 import로 교체**

`src/App.tsx`에서 `function PlaygroundHome() { ... }` 인라인 함수를 제거하고, 상단에 import 추가:

```typescript
import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GAMES } from './games/registry'
import PlaygroundHome from './screens/PlaygroundHome'

export default function App() {
  return (
    <BrowserRouter basename="/JJangNol">
      <Suspense fallback={<div style={{ color: 'var(--color-text-muted)', padding: 24, textAlign: 'center' }}>로딩 중...</div>}>
        <Routes>
          <Route path="/" element={<PlaygroundHome />} />
          {GAMES.map(game => (
            <Route
              key={game.id}
              path={`/games/${game.id}/*`}
              element={<game.component />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: 빌드 확인**

```bash
cd /Users/user/Runner && npm run build 2>&1 | tail -20
```

Expected: 에러 없음

- [ ] **Step 5: 커밋**

```bash
git add src/screens/PlaygroundHome/ src/App.tsx
git commit -m "feat: PlaygroundHome 게임 선택 화면 추가"
```

---

## Task 9: GitHub Pages SPA 라우팅 처리

**Files:**
- Create: `public/404.html`
- Modify: `index.html`

GitHub Pages는 클라이언트 사이드 라우팅을 모른다. `/JJangNol/games/runner` 같은 경로로 직접 접속하면 404를 반환한다. `404.html`에서 경로를 쿼리스트링으로 인코딩해 `index.html`로 리다이렉트, `index.html`에서 history API로 복원한다.

- [ ] **Step 1: public/404.html 생성**

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script>
      var seg = 1
      var l = window.location
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + seg).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(seg).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      )
    </script>
  </head>
  <body></body>
</html>
```

- [ ] **Step 2: index.html에 SPA 복원 스크립트 삽입**

`index.html`의 `<head>` 안, `<title>` 전에 다음을 추가:

```html
<script>
  (function(l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      }).join('?')
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
      )
    }
  }(window.location))
</script>
```

그리고 `<title>`도 수정:

```html
<title>짱하의 놀이터</title>
```

- [ ] **Step 3: 빌드 확인**

```bash
cd /Users/user/Runner && npm run build 2>&1 | tail -5
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add public/404.html index.html
git commit -m "feat: GitHub Pages SPA 라우팅 처리 (404.html 리다이렉트)"
```

---

## Task 10: 테스트 + 최종 빌드

**Files:** 없음 (검증만)

- [ ] **Step 1: 단위 테스트 전체 실행**

```bash
cd /Users/user/Runner && npm test
```

Expected: 전체 PASS (cards, highlight, validation, winCondition 테스트)

- [ ] **Step 2: TypeScript 타입 체크**

```bash
cd /Users/user/Runner && npx tsc --noEmit 2>&1
```

Expected: 에러 없음

- [ ] **Step 3: 프로덕션 빌드**

```bash
cd /Users/user/Runner && npm run build 2>&1
```

Expected: `dist/` 생성, 에러 없음

- [ ] **Step 4: 로컬 프리뷰**

```bash
cd /Users/user/Runner && npm run preview
```

브라우저에서 `http://localhost:4173/JJangNol/` 접속 → 짱하의 놀이터 홈 확인
`/JJangNol/games/runner` 클릭 → 도망자 홈 화면 확인

- [ ] **Step 5: main push → 배포 확인**

```bash
git push origin main
```

GitHub Actions 빌드 완료 후 `https://byeongjae-jeon.github.io/JJangNol/` 접속 확인.

---

## 자가 검토

### 스펙 커버리지

| 스펙 항목 | 구현 태스크 |
|---|---|
| `react-router-dom v6` 설치 | Task 1 |
| `src/games/runner/` 이동 | Task 2 |
| `src/shared/firebase/` 분리 | Task 2 + Task 3 |
| `registry.ts` 작성 | Task 7 |
| `App.tsx` 라우터 교체 | Task 7 |
| `PlaygroundHome` 화면 | Task 8 |
| GitHub Pages SPA `404.html` | Task 9 |
| Firebase DB 경로 `rooms/runner/` 분리 | Task 3 |
| 배포 확인 | Task 10 |

### 주의사항
- Firebase DB의 기존 `rooms/` 경로 데이터는 `rooms/runner/` 이동 후 접근 불가 → 진행 중인 방이 있으면 배포 전 종료
- react-router-dom v7이 설치될 경우 `BrowserRouter` API는 동일하나 타입이 다를 수 있음 — `npm run build`로 확인
