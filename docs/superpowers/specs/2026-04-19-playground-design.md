# 짱하의 놀이터 — 설계 문서

**날짜:** 2026-04-19  
**프로젝트:** Runner 레포 확장 → 멀티게임 플랫폼 "짱하의 놀이터"  
**스택:** React 18 + TypeScript + Vite + Firebase Realtime Database + GitHub Pages

---

## 1. 개요

기존 "도망자" 앱을 멀티게임 플랫폼으로 확장한다.  
주요 사용 패턴: 2명이 방 코드를 공유해 입장 → 게임 선택 → 플레이.  
회원가입·로그인 없이 방 코드만으로 접속하는 경량 구조를 유지한다.

**목표 게임 목록 (1차):**

| 게임 | 인원 | 방식 |
|---|---|---|
| 도망자 | 1대1 | 경쟁 |
| 캔트스탑 | 1대1 | 경쟁 |
| 더 게임 | 2인 | 협동 |
| 스플랜더 대결 | 1대1 | 경쟁 |
| 로스트시티 | 1대1 | 경쟁 |
| 배틀쉽 | 1대1 | 경쟁 |

---

## 2. 아키텍처

### 2.1 디렉토리 구조

기존 `src/` 코드를 게임별 폴더로 재구성한다.

```
src/
  games/
    registry.ts          ← 게임 목록 단일 관리 파일
    runner/              ← 기존 코드 이동
      components/
      screens/
      hooks/
      utils/
      types/
    cant-stop/
    the-game/
    splendor/
    lost-cities/
    battleship/
  shared/
    firebase/            ← 기존 src/firebase/ 이동
    hooks/
      useRoom.ts         ← 방 생성/참가 공통 로직
    types/
      room.ts            ← 공통 Room 타입
  screens/
    PlaygroundHome/      ← 게임 선택 화면 (신규)
  App.tsx
  index.css
  main.tsx
```

### 2.2 게임 레지스트리

게임 추가 시 `registry.ts` 한 파일만 수정하면 홈 카드·라우트가 자동 반영된다.

```ts
// src/games/registry.ts
export interface GameEntry {
  id: string
  name: string
  emoji: string
  players: string       // 표시용 문자열 (예: '1대1', '2인 협동')
  component: React.ComponentType
}

export const GAMES: GameEntry[] = [
  { id: 'runner',      name: '도망자',     emoji: '🎲', players: '1대1',    component: RunnerApp },
  { id: 'cant-stop',   name: '캔트스탑',   emoji: '🎯', players: '1대1',    component: CantStopApp },
  { id: 'the-game',    name: '더 게임',    emoji: '🃏', players: '2인 협동', component: TheGameApp },
  { id: 'splendor',    name: '스플랜더',   emoji: '💎', players: '1대1',    component: SplendorApp },
  { id: 'lost-cities', name: '로스트시티', emoji: '🏔️', players: '1대1',    component: LostCitiesApp },
  { id: 'battleship',  name: '배틀쉽',     emoji: '⚓', players: '1대1',    component: BattleshipApp },
]
```

### 2.3 라우팅

`react-router-dom v6`을 추가한다.

```
/                    → PlaygroundHome (게임 선택)
/games/:gameId       → 해당 게임 앱 (registry에서 component 조회)
```

App.tsx는 GAMES 배열을 순회해 라우트를 동적 생성한다. 알 수 없는 gameId는 홈으로 리다이렉트.

### 2.4 Firebase DB 경로

기존 Runner의 `rooms/{roomCode}` 구조를 게임별로 분리한다.

```
rooms/
  runner/{roomCode}/...
  cant-stop/{roomCode}/...
  the-game/{roomCode}/...
  splendor/{roomCode}/...
  lost-cities/{roomCode}/...
  battleship/{roomCode}/...
```

각 게임의 roomCode 생성·참가 로직은 공통 `useRoom` 훅을 기반으로 하되, 게임별 초기 상태 구조는 각 게임 폴더에서 정의한다.

---

## 3. 공통 인프라 (`src/shared/`)

### 3.1 방 시스템

현재 Runner의 방 관련 로직(`useRoom`, 방 생성/참가 화면)에서 게임 무관한 부분을 추출해 공유한다.

**공통으로 처리:**
- 방 코드 생성 (4자리 랜덤)
- Firebase `rooms/{gameId}/{roomCode}` 쓰기/읽기
- players 필드 관리 (player1, player2)
- 연결 해제 감지

**게임별로 처리:**
- 초기 게임 상태 구조 (`gameState` 필드)
- 게임별 비즈니스 로직 훅

### 3.2 공통 타입

```ts
// src/shared/types/room.ts
export interface RoomBase {
  players: { player1: string; player2: string }
  status: 'waiting' | 'playing' | 'finished'
  createdAt: number
}
```

각 게임은 `RoomBase`를 확장해 `gameState` 필드를 추가한다.

---

## 4. PlaygroundHome (게임 선택 화면)

- 경로: `/`
- GAMES 배열을 읽어 게임 카드 그리드로 표시
- 카드: 이모지 + 게임명 + 인원 표시
- 클릭 시 `/games/{gameId}`로 이동
- 기존 Runner의 보드게임 클래식 테마(`--color-bg`, `--color-gold` 등) 유지

---

## 5. 기존 Runner 마이그레이션

기존 코드를 `src/games/runner/`로 이동하는 작업이 필요하다.

**이동 대상:**
- `src/components/` → `src/games/runner/components/`
- `src/screens/` (HomeScreen, LobbyScreen, GameScreen, ResultScreen) → `src/games/runner/screens/`
- `src/hooks/` → `src/games/runner/hooks/` (공통 훅 제외)
- `src/utils/` → `src/games/runner/utils/`
- `src/types/` → `src/games/runner/types/`
- `src/firebase/` → `src/shared/firebase/`

**Runner 진입점:**
`src/games/runner/RunnerApp.tsx` — 기존 App.tsx의 Runner 내부 상태 관리를 담당.

---

## 6. 배포

GitHub Pages 단일 배포 유지. Vite `base: '/Runner/'` 설정 유지.  
SPA 라우팅을 위해 `404.html` 리다이렉트 처리가 필요하다 (GitHub Pages는 클라이언트 라우팅 미지원).

---

## 7. 구현 순서 (권장)

1. `react-router-dom` 설치
2. 기존 Runner 코드 `src/games/runner/`로 이동 + import 경로 수정
3. `src/shared/firebase/` 분리
4. `src/games/registry.ts` 작성
5. `App.tsx` 라우터로 교체
6. `PlaygroundHome` 신규 작성
7. GitHub Pages SPA 라우팅 처리 (404.html)
8. 배포 확인
9. 이후 게임별로 순차 구현

---

## 8. 범위 외 (이번 설계에서 제외)

- 사용자 계정·로그인 (방 코드 방식 유지)
- 전적·통계 저장
- 관전 모드
- 채팅
