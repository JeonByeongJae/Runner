import { describe, it, expect } from 'vitest'
import { COLS, getColumnSize, isVictory, initBoard } from './columns'

describe('COLS', () => {
  it('2열은 3칸', () => expect(COLS[2]).toBe(3))
  it('7열은 13칸', () => expect(COLS[7]).toBe(13))
  it('12열은 3칸', () => expect(COLS[12]).toBe(3))
})

describe('getColumnSize', () => {
  it('숫자로 칸 수를 반환한다', () => expect(getColumnSize(7)).toBe(13))
})

describe('isVictory', () => {
  it('잠긴 열이 3개 미만이면 false', () => {
    const board = initBoard()
    board['7'].locked = 'host'
    board['8'].locked = 'host'
    expect(isVictory(board, 'host')).toBe(false)
  })

  it('잠긴 열이 3개이면 true', () => {
    const board = initBoard()
    board['7'].locked = 'host'
    board['8'].locked = 'host'
    board['9'].locked = 'host'
    expect(isVictory(board, 'host')).toBe(true)
  })

  it('상대방 잠금은 카운트 안 함', () => {
    const board = initBoard()
    board['7'].locked = 'guest'
    board['8'].locked = 'guest'
    board['9'].locked = 'guest'
    expect(isVictory(board, 'host')).toBe(false)
  })
})
