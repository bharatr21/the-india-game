import { useRef, useState } from 'react'
import IndiaMap from '../components/IndiaMap.tsx'
import PageIntro from '../components/PageIntro.tsx'
import DifficultySwitch from '../components/DifficultySwitch.tsx'
import { ENTITIES } from '../data/states.ts'
import { matchesAnswer, pickRandom } from '../game.ts'

type Feedback = { type: 'correct' | 'wrong'; text: string }

/**
 * A discriminated union rather than a bare string, so `phase === 'capitol'`
 * is a compile error instead of a silent no-op. `complete` carries how the
 * round ended, which means the "next" button can describe what happened
 * without a second piece of state that could disagree with this one.
 */
type RoundState =
  | { phase: 'name' }
  | { phase: 'capital' }
  | { phase: 'complete'; outcome: 'solved' | 'skipped' }

const START: RoundState = { phase: 'name' }

export default function MapGame() {
  const [hard, setHard] = useState(false)
  const [target, setTarget] = useState(() => pickRandom(ENTITIES))
  const [round, setRound] = useState<RoundState>(START)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [solved, setSolved] = useState(0)
  const [streak, setStreak] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetRound = (nextHard: boolean = hard) => {
    setTarget((current) => pickRandom(ENTITIES, current.code))
    setRound(START)
    setAnswer('')
    setFeedback(null)
    if (nextHard !== hard) setStreak(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const award = (text: string) => {
    setSolved((value) => value + 1)
    setStreak((value) => value + 1)
    setFeedback({ type: 'correct', text })
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!answer.trim() || round.phase === 'complete') return

    if (round.phase === 'name') {
      if (matchesAnswer(answer, target.name, target.nameAliases)) {
        setAnswer('')
        if (hard) {
          setRound({ phase: 'capital' })
          setFeedback({ type: 'correct', text: `${target.name.toUpperCase()} IS RIGHT. NOW: ITS CAPITAL?` })
        } else {
          setRound({ phase: 'complete', outcome: 'solved' })
          award(`CORRECT. ${target.name.toUpperCase()} / ${target.capital.toUpperCase()}`)
        }
      } else {
        setStreak(0)
        setFeedback({ type: 'wrong', text: 'NOT THAT ONE. LOOK AT THE SHAPE AND TRY AGAIN.' })
      }
      return
    }

    if (matchesAnswer(answer, target.capital, target.capitalAliases)) {
      setRound({ phase: 'complete', outcome: 'solved' })
      award(`LOCKED IN. ${target.capital.toUpperCase()}, ${target.name.toUpperCase()}.`)
    } else {
      setStreak(0)
      setFeedback({ type: 'wrong', text: `NOPE. ${target.name.toUpperCase()}'S CAPITAL IS STILL OUT THERE.` })
    }
  }

  const skip = () => {
    setRound({ phase: 'complete', outcome: 'skipped' })
    setStreak(0)
    setFeedback({ type: 'wrong', text: `SKIPPED: ${target.name.toUpperCase()} / ${target.capital.toUpperCase()}` })
  }

  const askingCapital = round.phase === 'capital'
  const done = round.phase === 'complete'
  const kind = target.type === 'state' ? 'STATE' : 'UNION TERRITORY'

  return (
    <div className="page game-page">
      <PageIntro
        number="01"
        title="NAME THAT STATE"
        description="Identify the highlighted state or union territory. Hard mode adds its capital."
      />
      <div className="game-toolbar">
        <DifficultySwitch hard={hard} onChange={(value) => { setHard(value); resetRound(value) }} />
        <div className="score-strip">
          <span>SOLVED <b>{String(solved).padStart(2, '0')}</b></span>
          <span>STREAK <b>{String(streak).padStart(2, '0')}</b></span>
        </div>
      </div>
      <div className="map-game-layout">
        <IndiaMap highlightedCode={target.code} />
        <section className="answer-panel">
          <span className="panel-index">PROMPT / {askingCapital ? '02' : '01'}</span>
          <h2>
            {askingCapital
              ? `WHAT IS THE CAPITAL OF ${target.name.toUpperCase()}?`
              : 'WHICH STATE OR UT IS HIGHLIGHTED?'}
          </h2>
          <form onSubmit={submit}>
            <label htmlFor="map-answer">TYPE YOUR ANSWER</label>
            <input
              ref={inputRef}
              id="map-answer"
              value={answer}
              disabled={done}
              onChange={(event) => setAnswer(event.target.value)}
              autoComplete="off"
              autoFocus
              placeholder={askingCapital ? 'CAPITAL CITY...' : `${kind} NAME...`}
            />
            {!done && <button className="brutal-button" type="submit">CHECK ANSWER →</button>}
          </form>
          {feedback && <div className={`feedback ${feedback.type}`} role="status">{feedback.text}</div>}
          <div className="panel-actions">
            {round.phase === 'complete' ? (
              <button className="text-button next" onClick={() => resetRound()}>
                {round.outcome === 'solved' ? 'NEXT ONE →' : 'TRY ANOTHER →'}
              </button>
            ) : (
              <button className="text-button" onClick={skip}>I DON'T KNOW / REVEAL</button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
