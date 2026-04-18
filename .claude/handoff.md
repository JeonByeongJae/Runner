# Handoff — 2026-04-17

## 브랜치 / 커밋
- 브랜치: `main`
- 최근 커밋:
  a2f2f09 fix: runner place limit highlight, booster eliminated, larger fonts, auto turn-end
  ccde41d fix: normalize piles arrays from Firebase (prevent undefined.length crash)
  e2498e2 fix: chaser UX, auto turn-end, booster reveal, 42 placement rule
  95bc0b7 fix: normalize empty arrays from Firebase in all get() calls
  6495b02 fix: persist cardsPlacedThisTurn in Firebase + chaser guess feedback

## 미커밋 변경사항
없음

## 진행 중인 작업
없음. 이번 세션 작업 전부 완료 후 main 배포됨.

## 완료된 것
- 추격자 첫 턴 드로우 크래시 수정 (`chaserHand` null 처리)
- Firebase 배열 정규화 전면 적용 (`subscribeRoom` + 모든 `get()` 호출)
- `piles` undefined 크래시 수정 (도망자 패스 후 추격자 드로우 시)
- 추격자 추리 UI 개선: trail 카드 탭 → 번호판 선택 → guessBadge 표시
- 추리 결과 피드백 플래시 (2초, 정답/오답)
- 추리 성공 시 자동 부스터 `eliminated` 처리
- 42번 카드 특례 제거 (일반 간격 규칙 적용)
- 추격자 추리 제출 후 자동 턴 종료 (별도 버튼 불필요)
- 도망자 최대 배치 수 도달 시 자동 턴 종료
- 손패 카드 숫자 크기 14px → 18px, 배지 폰트도 증가
- 도망자 하이라이트: `canPlaceMore` false 시 빈 배열 (추가 배치 불가)
- git-workflow-guard.sh에 Runner 리포 예외 적용 (main 직접 push 허용)
- `fix/m/runner-chaser-fixes` → main 머지 및 GitHub Pages 배포 완료

## 다음에 할 것
특별히 예정된 작업 없음. 게임 플레이 테스트 후 발견되는 버그나 UX 개선 요청을 처리하면 됨.

테스트 체크리스트 (아직 실제 2인 플레이로 검증 안 된 것):
1. 도망자 첫 턴: 2장 배치 후 자동 턴 종료 → 추격자로 넘어가는지
2. 추격자 첫 턴: 2장 드로우 정상 동작 확인
3. 추리 성공 시: 카드 공개 + 부스터 eliminated + 피드백 플래시
4. 추리 실패 시: 피드백 플래시 + 도망자 턴으로 복귀

## 주요 결정 / 맥락
- Firebase는 빈 배열을 null/undefined로, 일반 배열을 숫자 키 객체로 반환 → `toArray<T>()` 헬퍼로 전처리 필수. `subscribeRoom`과 `get()` 사용 함수 모두 적용해야 함.
- `cardsPlacedThisTurn`은 Firebase에 저장해 새로고침/재접속 후에도 유지.
- 추격자 추리 흐름: trail 카드 탭(activeTrailIdx 설정) → ChaserBoard 번호 클릭(toggleGuess) → ActionPanel 제출. `submitGuess`가 내부에서 턴 전환까지 처리.
- 도망자 자동 턴 종료는 `handleConfirmPlace`에서 `cardsPlacedThisTurn + 1 >= maxPlace` 조건으로 처리.

## 주의사항
- `runnerHand` 값은 추격자 클라이언트에 노출 금지 — 현재는 Firebase Rules가 없어 보안 미적용 상태. 프로덕션 배포 전 Rules 설정 필요.
- `submitGuess` 내부에서 `toArray<TrailCard>()` 타입 명시 필요 (TypeScript 타입 에러 방지).
- `ActionPanel` Props에서 `onEndTurn` 제거됨 — 혹시 다른 곳에서 참조 시 주의.
