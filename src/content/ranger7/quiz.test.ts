import { describe, expect, it } from 'vitest'
import { machines } from './machines'
import { machineQuizzes } from './quiz'

describe('the star quiz', () => {
  it('gives every machine ten questions', () => {
    expect(Object.keys(machineQuizzes)).toHaveLength(17)
    for (const machine of machines) {
      const quiz = machineQuizzes[machine.id]
      expect(quiz, machine.id).toHaveLength(10)
      expect(new Set(quiz.map((question) => question.id)).size).toBe(10)
    }
  })

  it('asks a bilingual question with four distinct bilingual options', () => {
    for (const machine of machines) {
      for (const question of machineQuizzes[machine.id]) {
        expect(question.prompt.en.trim(), question.id).not.toBe('')
        expect(question.prompt.bn.trim(), question.id).not.toBe('')
        expect(question.explain.en.trim(), question.id).not.toBe('')
        expect(question.explain.bn.trim(), question.id).not.toBe('')
        expect(question.options, question.id).toHaveLength(4)
        expect(new Set(question.options.map((option) => option.en)).size).toBe(4)
        expect(new Set(question.options.map((option) => option.bn)).size).toBe(4)
        for (const option of question.options) {
          expect(option.en.trim(), question.id).not.toBe('')
          expect(option.bn.trim(), question.id).not.toBe('')
        }
      }
    }
  })

  it('marks exactly one valid correct answer', () => {
    for (const machine of machines) {
      for (const question of machineQuizzes[machine.id]) {
        expect(question.correctIndex, question.id).toBeGreaterThanOrEqual(0)
        expect(question.correctIndex, question.id).toBeLessThan(4)
        expect(question.options[question.correctIndex], question.id).toBeDefined()
      }
    }
  })

  it('uses a different kind of question for each of the ten rounds', () => {
    for (const machine of machines) {
      const ids = machineQuizzes[machine.id].map((question) => question.id.replace(`${machine.id}-`, ''))
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.slice(0, 5)).toEqual(['year', 'destination', 'ending', 'sequence', 'pandastein'])
      expect(ids[9]).toBe('voice')
    }
  })
})
