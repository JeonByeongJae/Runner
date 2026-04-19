# Can't Stop (캔트스탑) — 설계 문서

**날짜:** 2026-04-20  
**프로젝트:** JJangNol — 캔트스탑 보드게임 온라인 구현  
**스택:** React + TypeScript + Vite + Firebase Realtime Database + GitHub Pages

---

## 1. 개요

캔트스탑 보드게임을 웹/모바일에서 1대1 온라인으로 플레이할 수 있는 앱.  
기존 Runner(도망자) 프로젝트의 `PlaygroundHome` 게임 선택 화면에서 진입.  
Firebase Realtime Database로 실시간 게임 상태를 동기화하며, 방 코드 공유 방식으로 입장.

---

## 2. 게임 규칙 (구현 기준)

### 기본 구성
- 플레이어: 2명 고정 (1대1)
- 베리언트: 기본 규칙만 적용
- 주사위: 4개

### 보드
- 등반로(column): 2~12, 총 11개 — 항상 전부 표시
- 열별 칸 수:

| 숫자 | 칸 수 |
|------|-------|
| 2    | 3     |
| 3    | 5     |
| 4    | 7     |
| 5    | 9     |
| 6    | 11    |
| 7    | 13    |
| 8    | 11    |
| 9    | 9     |
| 10   | 7     |
| 11   | 5     |
| 12   | 3     |

### 턴 진행
1. 플레이어가 주사위 4개를 굴린다.
2. 4개 주사위를 2+2로 나누는 조합 3가지 중 하나를 선택한다.
   - (d1+d2) / (d3+d4)
   - (d1+d3) / (d2+d4)
   - (d1+d4) / (d2+d3)
3. 선택한 조합의 두 합계에 해당하는 등반로에서 등반자(피켈)를 1칸 올린다.
   - 등반자가 없는 등반로면 새 등반자를 배치한다.
   - 등반자는 턴 중에만 유효한 임시 위치. 최대 3개 동시 운용.
4. 선택 가능한 조합이 없으면(등반자 3개 모두 꽉 찼고 해당 열 없음) 자동 종료.
5. 플레이어는 **베이스캠프** 또는 **계속 굴리기** 선택:
   - 베이스캠프: 등반자 위치를 내 캠프로 확정, 상대 턴으로 넘김
   - 계속 굴리기: 다시 주사위 굴림. 이때 선택 불가 조합이 나오면 등반자 위치 전부 소멸(버스트)

### 등반자 제한
- 동시에 운용 가능한 등반자: 최대 3개
- 베이스캠프/계속굴리기 버튼은 등반자가 1개 이상 배치된 후에만 활성화

### 승리 조건
- 한 플레이어가 3개의 등반로를 정상(최상단 칸)까지 점령하면 승리
- 정상 점령: 해당 등반로에 내 캠프가 최상단에 확정된 상태

### 등반로 잠금
- 한 플레이어가 특정 등반로 정상을 점령하면 해당 열은 잠김
- 잠긴 열은 상대방이 더 이상 등반 불가

---

## 3. UI 구성

### 화면 구조
```
[TurnBanner]      ← 현재 턴 + 등반자 수 표시
[MountainBoard]   ← 2~12 등반로 가로 목록
[ActionPanel]     ← 주사위 + 조합 선택 + 버튼
```

### TurnBanner
- "내 차례 — 등반 중 (등반자 N/3)" 형식
- 상대 턴일 때: "상대 차례 — 기다리는 중..."
- 배경: `#1a0e08`, 금색 하단 보더, 금색 텍스트

### MountainBoard
- 각 열을 세로 칸 목록으로 표시 (위쪽이 정상)
- 칸 크기: 30×30px
- 칸 상태별 스타일:
  - 기본: `background: #2c1810; border: 1px solid #3d2415`
  - 등반자(피켈): `background: #3a2a10; border: #c8a45a; box-shadow: 0 0 6px #c8a45a88`
  - 내 캠프(텐트): `background: #1d3a1d; border: #3db83d`
  - 상대 캠프(텐트): `background: #3a1a1a; border: #cc3333`
- 열 레이블(숫자)은 하단, 등반 중인 열은 금색 강조

### 아이콘 (22×22px SVG)
- **등반자 (피켈)**: 금색 곡괭이
  ```
  샤프트: (5,20)→(17,8), stroke #a07830, stroke-width 2.2
  헤드:   M9,5 C15,3 22,7 20,13 L18,11 C20,8 15,5 11,6 Z, fill #c8a45a
  ```
- **내 캠프 (텐트)**: 초록 텐트
  ```
  외형: polygon(12,4 3,20 21,20), fill #1d6b1d, stroke #3db83d
  내부: polygon(12,4 7,20 17,20), fill #0d4a0d
  문:   rect(9.5,14 5×6 rx1.5), fill #3db83d
  ```
- **상대 캠프 (텐트)**: 빨간 텐트 (내 캠프와 동일 구조, 색상만 다름)
  ```
  fill #6b1d1d, stroke #cc3333, 내부 #4a0d0d
  ```

### ActionPanel
- **주사위 영역**: 4개 주사위 가로 나열, 48×48px, `background: #5c3a1e`
- **조합 카드**: 3가지 조합을 카드 형태로 표시
  - 선택된 카드: `border: #c8a45a; background: #3a2010`
  - 비활성(사용 불가): `opacity: 0.3`
  - 합계 큰 글씨 + 세부 조합 작은 글씨
- **버튼**:
  - 베이스캠프: 초록 계열 (`background: #1d4a1d; color: #6ddf6d; border: #3db83d`)
  - 계속 굴리기: 빨간 계열 (`background: #4a1a1a; color: #df6d6d; border: #cc3333`)

---

## 4. 데이터 모델 (Firebase)

### Firebase 경로
```
rooms/cant-stop/{roomCode}/
```

### RoomState
```typescript
interface CantStopRoomState {
  phase: 'waiting' | 'playing' | 'finished'
  players: {
    [uid: string]: {
      name: string
      ready: boolean
    }
  }
  turn: string              // 현재 턴 플레이어 uid
  board: {
    [col: number]: {        // 2~12
      camps: {              // 확정된 캠프 위치
        [uid: string]: number  // 칸 번호 (1~최대)
      }
      locked: string | null // 점령한 플레이어 uid, null이면 미점령
    }
  }
  climbers: {               // 턴 중 임시 등반자 위치
    [col: number]: number   // 칸 번호
  }
  dice: number[]            // 현재 굴린 주사위 4개 값
  winner: string | null
}
```

---

## 5. 구현 계획

### 디렉토리 구조
```
src/
  games/
    cant-stop/
      screens/
        HomeScreen/
        LobbyScreen/
        GameScreen/
        ResultScreen/
      hooks/
        useCantStopGame.ts
      utils/
        columns.ts        // 열별 칸 수, 승리 조건 등
        dice.ts           // 조합 계산
      types/
        index.ts
      CantStopApp.tsx
```

### shared 훅 수정
- 기존 `src/hooks/useRoom.ts`를 `useRoom<T>` 제네릭으로 수정
- Runner와 캔트스탑이 공유

### 게임 레지스트리 등록
```typescript
// src/games/registry.ts 에 추가
{
  id: 'cant-stop',
  name: "Can't Stop",
  description: '주사위 등반 게임',
  component: CantStopApp,
}
```

---

## 6. 비주얼 테마

Runner와 동일한 보드게임 클래식 팔레트 공유:

```css
--color-bg:        #2c1810
--color-surface:   #1a0e08
--color-card-face: #5c3a1e
--color-gold:      #c8a45a
--color-border:    #8a6a30
--color-text:      #f5e6c8
--color-text-muted:#a08060
```
