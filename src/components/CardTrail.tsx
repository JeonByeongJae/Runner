import type { TrailCard, Role } from '../types/game'
import styles from './CardTrail.module.css'

interface Props {
  trail: TrailCard[]
  myRole: Role
  onCardTap?: (index: number) => void
  selectedIndices?: number[]   // 이미 추리 값이 배정된 카드
  activeIdx?: number | null    // 현재 번호 입력 중인 카드
  guessAttempt?: { trailIndex: number; value: number }[]
}

export default function CardTrail({
  trail,
  myRole,
  onCardTap,
  selectedIndices = [],
  activeIdx = null,
  guessAttempt = [],
}: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.label}>카드 경로</div>
      <div className={styles.trail}>
        {trail.map((card, i) => {
          const isRevealed = card.face === 'revealed'
          const isSelected = selectedIndices.includes(i)
          const isActive = activeIdx === i
          const isGuessable = myRole === 'chaser' && !isRevealed && i > 0
          const assignedGuess = guessAttempt.find(g => g.trailIndex === i)

          return (
            <div
              key={i}
              className={[
                styles.card,
                isRevealed ? styles.revealed : styles.faceDown,
                isActive ? styles.active : isSelected ? styles.selected : '',
                isGuessable ? styles.guessable : '',
              ].join(' ')}
              onClick={() => isGuessable && onCardTap?.(i)}
            >
              {isRevealed && (
                <span className={styles.value}>{card.value}</span>
              )}
              {myRole === 'runner' && !isRevealed && (
                <span className={styles.secretValue}>{card.value}</span>
              )}
              {/* 부스터: 뒷면일 때 발자국 수, 공개됐을 때 실제 카드 번호 */}
              {card.boosters && card.boosters.length > 0 && (
                <span className={styles.boosterBadge}>
                  {isRevealed
                    ? card.boosters.join(' ')
                    : `+${card.boosters.reduce((s, b) => s + (b % 2 === 0 ? 2 : 1), 0)}`}
                </span>
              )}
              {/* 추격자에게 배정된 추리 숫자 표시 */}
              {myRole === 'chaser' && !isRevealed && assignedGuess && (
                <span className={styles.guessBadge}>{assignedGuess.value}</span>
              )}
            </div>
          )
        })}
      </div>
      {/* 현재 추리 중인 카드 안내 */}
      {myRole === 'chaser' && activeIdx !== null && (
        <div className={styles.activeHint}>
          카드 {activeIdx}번 선택 — 번호판에서 숫자를 고르세요
        </div>
      )}
    </section>
  )
}
