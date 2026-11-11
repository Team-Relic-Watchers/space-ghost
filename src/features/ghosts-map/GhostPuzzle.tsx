import { Puzzle, RotateCcw, Shuffle, Trophy } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../../i18n'
import { useGameStore } from '../../game/store'
import type { GhostPhoto } from '../../content/ranger7/photos'
import './puzzle.css'

interface GhostPuzzleProps {
  name: string
  image: GhostPhoto
}

/** A 3 x 3 picture puzzle with five pieces waiting outside the board. */
const SIZE = 3
const PIECES = SIZE * SIZE
const MISSING = 5

interface PuzzleState {
  /** Each slot holds the piece that belongs there, or null while it is empty. */
  board: (number | null)[]
  /** The pieces still waiting in the tray. */
  tray: number[]
}

const createPuzzle = (): PuzzleState => {
  const holes = new Set<number>()
  while (holes.size < MISSING) {
    holes.add(Math.floor(Math.random() * PIECES))
  }

  const board = Array.from({ length: PIECES }, (_, slot) =>
    holes.has(slot) ? null : slot,
  )
  const tray = [...holes]
  for (let i = tray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = tray[i]
    tray[i] = tray[j]
    tray[j] = swap
  }

  return { board, tray }
}

const isSolved = (board: (number | null)[]) =>
  board.every((piece, slot) => piece === slot)

/** The crop of the cartoon photograph that belongs to one piece. */
const pieceStyle = (image: GhostPhoto, piece: number) => {
  const column = piece % SIZE
  const row = Math.floor(piece / SIZE)
  return {
    backgroundImage: `url(${image.src})`,
    backgroundPosition: `${(column / (SIZE - 1)) * 100}% ${(row / (SIZE - 1)) * 100}%`,
  }
}

/**
 * A gentle jigsaw for young explorers. Most of the picture stays in place;
 * five pieces sit in a tray and are dragged (or tapped) back into the holes.
 */
export function GhostPuzzle({ name, image }: GhostPuzzleProps) {
  const { t } = useTranslation()
  const language = useGameStore((state) => state.language)
  const [puzzle, setPuzzle] = useState<PuzzleState | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<{ slot: number; id: number } | null>(null)
  const titleId = useId()

  const solved = puzzle !== null && isSolved(puzzle.board)

  // The wrong-spot warning fades away on its own.
  useEffect(() => {
    if (!wrong) return
    const timer = window.setTimeout(() => setWrong(null), 520)
    return () => window.clearTimeout(timer)
  }, [wrong])

  const start = () => {
    setPuzzle(createPuzzle())
    setSelected(null)
    setWrong(null)
  }

  const place = (piece: number, slot: number) => {
    if (!puzzle || solved || puzzle.board[slot] !== null) return

    if (piece !== slot) {
      setWrong({ slot, id: Date.now() })
      return
    }

    const board = [...puzzle.board]
    board[slot] = piece
    setPuzzle({ board, tray: puzzle.tray.filter((waiting) => waiting !== piece) })
    setSelected(null)
  }

  const dropOnSlot = (event: DragEvent<HTMLButtonElement>, slot: number) => {
    event.preventDefault()
    const piece = Number(event.dataTransfer.getData('text/plain'))
    if (!Number.isInteger(piece) || piece < 0 || piece >= PIECES) return
    place(piece, slot)
  }

  return (
    <section className="ghost-puzzle" aria-labelledby={titleId}>
      {puzzle === null ? (
        <div className="ghost-puzzle__launch">
          <div className="ghost-puzzle__intro">
            <span className="ghost-puzzle__eyebrow">
              <Puzzle size={16} aria-hidden="true" />
              {t('ghostStory.puzzle.eyebrow')}
            </span>
            <h3 id={titleId} className="ghost-puzzle__title">
              {t('ghostStory.puzzle.title')}
            </h3>
            <p className="ghost-puzzle__lede">
              {t('ghostStory.puzzle.intro', { name })}
            </p>
          </div>
          <button type="button" className="ghost-puzzle__action" onClick={start}>
            <Puzzle size={18} aria-hidden="true" />
            {t('ghostStory.puzzle.play')}
          </button>
        </div>
      ) : (
        <div className="ghost-puzzle__game">
          <header className="ghost-puzzle__head">
            <div className="ghost-puzzle__intro">
              <span className="ghost-puzzle__eyebrow">
                <Puzzle size={16} aria-hidden="true" />
                {t('ghostStory.puzzle.eyebrow')}
              </span>
              <h3 id={titleId} className="ghost-puzzle__title">
                {t('ghostStory.puzzle.title')}
              </h3>
              <p className="ghost-puzzle__lede">{t('ghostStory.puzzle.hint')}</p>
            </div>

            <div className="ghost-puzzle__meta">
              <span className="ghost-puzzle__moves">
                {t('ghostStory.puzzle.piecesLeft', {
                  count: formatNumber(puzzle.tray.length, language),
                })}
              </span>
              <button type="button" className="ghost-puzzle__shuffle" onClick={start}>
                <Shuffle size={16} aria-hidden="true" />
                {t('ghostStory.puzzle.shuffle')}
              </button>
            </div>
          </header>

          {/* Board and tray side by side: the pieces always sit right next to
              the holes they belong in, so a drag never has to travel far. */}
          <div className="ghost-puzzle__stage">
            <div className="ghost-puzzle__board" data-solved={solved ? 'true' : 'false'}>
              {puzzle.board.map((piece, slot) => {
                if (piece === null) {
                  return (
                    <button
                      key={wrong?.slot === slot ? `${slot}-${wrong.id}` : slot}
                      type="button"
                      className="ghost-puzzle__slot"
                      data-wrong={wrong?.slot === slot ? 'true' : 'false'}
                      aria-label={t('ghostStory.puzzle.emptySlot', {
                        number: formatNumber(slot + 1, language),
                      })}
                      onClick={() => {
                        if (selected !== null) place(selected, slot)
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        event.dataTransfer.dropEffect = 'move'
                      }}
                      onDrop={(event) => dropOnSlot(event, slot)}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  )
                }

                return (
                  <div
                    key={slot}
                    className="ghost-puzzle__piece"
                    style={pieceStyle(image, piece)}
                    role="img"
                    aria-label={t('ghostStory.puzzle.pieceLabel', {
                      slot: formatNumber(slot + 1, language),
                      piece: formatNumber(piece + 1, language),
                    })}
                  />
                )
              })}
            </div>

            <div className="ghost-puzzle__side">
              <figure className="ghost-puzzle__preview">
                <img src={image.src} alt={t('ghostStory.puzzle.previewLabel', { name })} />
                <figcaption>{t('ghostStory.puzzle.previewCaption')}</figcaption>
              </figure>

              <div className="ghost-puzzle__tray">
                <div className="ghost-puzzle__tray-copy">
                  <strong className="ghost-puzzle__tray-title">
                    {t('ghostStory.puzzle.trayTitle')}
                  </strong>
                  <p className="ghost-puzzle__tray-hint">
                    {t('ghostStory.puzzle.trayHint')}
                  </p>
                </div>

                <div className="ghost-puzzle__tray-pieces">
                  {puzzle.tray.length === 0 ? (
                    <span className="ghost-puzzle__tray-empty">
                      {t('ghostStory.puzzle.trayEmpty')}
                    </span>
                  ) : (
                    puzzle.tray.map((piece) => (
                      <button
                        key={piece}
                        type="button"
                        draggable
                        className="ghost-puzzle__tray-piece"
                        data-selected={selected === piece ? 'true' : 'false'}
                        style={pieceStyle(image, piece)}
                        aria-label={t('ghostStory.puzzle.pieceLabel', {
                          slot: formatNumber(piece + 1, language),
                          piece: formatNumber(piece + 1, language),
                        })}
                        aria-pressed={selected === piece}
                        onClick={() =>
                          setSelected((current) => (current === piece ? null : piece))
                        }
                        onDragStart={(event) => {
                          event.dataTransfer.setData('text/plain', String(piece))
                          event.dataTransfer.effectAllowed = 'move'
                          setSelected(null)
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {solved && (
            <div className="ghost-puzzle__solved" role="status">
              <Trophy size={30} aria-hidden="true" />
              <strong>{t('ghostStory.puzzle.solvedTitle')}</strong>
              <p>{t('ghostStory.puzzle.solvedLine', { name })}</p>
              <button type="button" className="ghost-puzzle__action" onClick={start}>
                <RotateCcw size={18} aria-hidden="true" />
                {t('ghostStory.puzzle.playAgain')}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
