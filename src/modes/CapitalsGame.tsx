import { useRef, useState } from 'react'
import PageIntro from '../components/PageIntro.tsx'
import { ENTITIES, type Entity } from '../data/states.ts'
import { drawFromDeck, matchesAnswer, normalizeAnswer } from '../game.ts'

type Feedback = { type: 'correct' | 'wrong'; text: string }

/**
 * The only place the game teaches rather than tests, so an alias hit gets
 * different copy from a canonical hit: answering "Nagpur" for Maharashtra is
 * correct AND worth explaining. `type` stays 'correct' | 'wrong' because those
 * are the only two feedback classes in styles.css.
 */
export function capitalFeedback(
  outcome: 'correct' | 'wrong' | 'revealed',
  entity: Entity,
  attempt: string,
): Feedback {
  const name = entity.name.toUpperCase()
  const capital = entity.capital.toUpperCase()

  if (outcome === 'revealed') {
    return { type: 'wrong', text: `${name} → ${capital}` }
  }

  if (outcome === 'wrong') {
    return { type: 'wrong', text: `NOT QUITE. THINK AGAIN ABOUT ${name}.` }
  }

  const alias = entity.capitalAliases.find(
    (candidate) => normalizeAnswer(candidate) === normalizeAnswer(attempt),
  )
  if (alias) {
    return {
      type: 'correct',
      text: `ACCEPTED / ${alias.toUpperCase()} — THOUGH ${capital} IS THE ONE USUALLY LISTED.`,
    }
  }

  return { type: 'correct', text: `CORRECT / ${capital}` }
}

export default function CapitalsGame() {
  // Sampling without replacement: deal from a shuffled deck of all 36 so
  // every state and UT is asked once before any repeats.
  const [draw, setDraw] = useState(() => drawFromDeck([], ENTITIES))
  const target = draw.entity
  const [answer, setAnswer] = useState('')
  const [complete, setComplete] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [solved, setSolved] = useState(0)
  const [streak, setStreak] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const next = () => {
    setDraw((current) => drawFromDeck(current.deck, ENTITIES, current.entity.code))
    setAnswer('')
    setComplete(false)
    setFeedback(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!answer.trim() || complete) return
    if (matchesAnswer(answer, target.capital, target.capitalAliases)) {
      setComplete(true)
      setSolved((value) => value + 1)
      setStreak((value) => value + 1)
      setFeedback(capitalFeedback('correct', target, answer))
    } else {
      setStreak(0)
      setFeedback(capitalFeedback('wrong', target, answer))
    }
  }

  const reveal = () => {
    setComplete(true)
    setStreak(0)
    setFeedback(capitalFeedback('revealed', target, answer))
  }

  const kind = target.type === 'state' ? 'STATE' : 'UNION TERRITORY'

  return (
    <div className="page game-page capital-page">
      <PageIntro
        number="02"
        title="CAPITAL CHECK"
        description="We name the state or union territory. You supply its seat of government."
        accent="blue"
      />
      <div className="capital-stage">
        <div className="capital-score score-strip">
          <span>SOLVED <b>{String(solved).padStart(2, '0')}</b></span>
          <span>STREAK <b>{String(streak).padStart(2, '0')}</b></span>
        </div>
        <div className="state-card">
          <span>{kind} / {target.code}</span>
          <strong>{target.name.toUpperCase()}</strong>
          <small>WHAT IS THE CAPITAL?</small>
        </div>
        <form className="capital-form" onSubmit={submit}>
          <label htmlFor="capital-answer">YOUR ANSWER</label>
          <div className="input-row">
            <input
              ref={inputRef}
              id="capital-answer"
              value={answer}
              disabled={complete}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="TYPE A CAPITAL CITY..."
              autoFocus
              autoComplete="off"
            />
            {!complete && <button className="brutal-button" type="submit">CHECK →</button>}
          </div>
          {feedback && <div className={`feedback ${feedback.type}`} role="status">{feedback.text}</div>}
        </form>
        <div className="capital-actions">
          {complete
            ? <button className="brutal-button blue-button" onClick={next}>NEXT ONE →</button>
            : <button className="text-button" onClick={reveal}>REVEAL ANSWER</button>}
        </div>
      </div>
    </div>
  )
}
