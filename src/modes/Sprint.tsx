import { useEffect, useMemo, useRef, useState } from 'react'
import PageIntro from '../components/PageIntro.tsx'
import { ENTITIES, type EntityCode } from '../data/states.ts'
import { findEntity, formatTime } from '../game.ts'

type Status = 'idle' | 'running' | 'finished'

export default function Sprint() {
  const [minutes, setMinutes] = useState(4)
  const [status, setStatus] = useState<Status>('idle')
  const [endAt, setEndAt] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)
  const [guessed, setGuessed] = useState<ReadonlySet<EntityCode>>(new Set())
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Ticks against an absolute deadline rather than decrementing a counter, so
  // the clock stays accurate when the tab is backgrounded and throttled.
  // Ticking faster than 1s keeps the displayed second from visibly stuttering.
  useEffect(() => {
    if (status !== 'running') return

    const timer = window.setInterval(() => {
      const nextSeconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      setSecondsLeft(nextSeconds)
      if (nextSeconds === 0) setStatus('finished')
    }, 200)

    return () => window.clearInterval(timer)
  }, [endAt, status])

  const start = () => {
    setGuessed(new Set())
    setAnswer('')
    setFeedback('')
    setSecondsLeft(minutes * 60)
    setEndAt(Date.now() + minutes * 60_000)
    setStatus('running')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!answer.trim() || status !== 'running') return
    const entity = findEntity(answer, ENTITIES)
    if (!entity) {
      setFeedback('NOT A STATE OR UT. FULL NAMES ONLY.')
      return
    }
    if (guessed.has(entity.code)) {
      setFeedback(`${entity.name.toUpperCase()} IS ALREADY ON THE BOARD.`)
      setAnswer('')
      return
    }
    const nextGuessed = new Set(guessed).add(entity.code)
    setGuessed(nextGuessed)
    setAnswer('')
    setFeedback(`+ ${entity.name.toUpperCase()}`)
    if (nextGuessed.size === ENTITIES.length) setStatus('finished')
  }

  const chooseMinutes = (value: number) => {
    setMinutes(value)
    setSecondsLeft(value * 60)
  }

  const found = useMemo(() => ENTITIES.filter((e) => guessed.has(e.code)), [guessed])
  const missed = useMemo(() => ENTITIES.filter((e) => !guessed.has(e.code)), [guessed])

  return (
    <div className="page game-page sprint-page">
      <PageIntro
        number="03"
        title="THE 36 SPRINT"
        description="Type all 28 states and 8 union territories before time expires. Full names only."
        accent="yellow"
      />
      <div className="sprint-console">
        <section className="timer-panel">
          <span className="panel-index">TIME REMAINING</span>
          <strong className={secondsLeft <= 30 && status === 'running' ? 'danger' : ''}>
            {formatTime(secondsLeft)}
          </strong>
          <div className="time-options" aria-label="Timer length">
            {[2, 4, 6].map((value) => (
              <button
                key={value}
                disabled={status === 'running'}
                className={minutes === value ? 'active' : ''}
                onClick={() => chooseMinutes(value)}
              >
                {value} MIN
              </button>
            ))}
          </div>
          {status !== 'running' ? (
            <button className="brutal-button yellow-button" onClick={start}>
              {status === 'idle' ? 'START THE CLOCK →' : 'RUN IT AGAIN →'}
            </button>
          ) : (
            <button className="text-button" onClick={() => setStatus('finished')}>END RUN</button>
          )}
        </section>

        <section className="sprint-board">
          <div className="sprint-progress">
            <span>FOUND <b>{guessed.size}</b> / 36</span>
            <div><i style={{ width: `${(guessed.size / ENTITIES.length) * 100}%` }} /></div>
          </div>
          <form onSubmit={submit}>
            <label htmlFor="sprint-answer">ENTER A STATE OR UT</label>
            <div className="input-row">
              <input
                ref={inputRef}
                id="sprint-answer"
                value={answer}
                disabled={status !== 'running'}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={status === 'running' ? 'E.G. MEGHALAYA' : 'START THE CLOCK FIRST'}
                autoComplete="off"
              />
              <button type="submit" className="brutal-button" disabled={status !== 'running'}>ADD +</button>
            </div>
          </form>
          <div className="sprint-feedback" role="status">
            {feedback || (status === 'finished' ? `RUN OVER / ${guessed.size} OF 36 FOUND` : 'WAITING FOR INPUT...')}
          </div>
          <div className="guessed-grid">
            {found.map((entity, index) => (
              <span key={entity.code}><b>{String(index + 1).padStart(2, '0')}</b>{entity.name}</span>
            ))}
          </div>
          {status === 'finished' && (
            <section className="missed-states" aria-live="polite">
              <div className="missed-heading">
                <strong>MISSED / {missed.length}</strong>
                <span>{missed.length === 0 ? 'PERFECT RUN.' : 'STUDY THESE AND GO AGAIN.'}</span>
              </div>
              {missed.length > 0 && (
                <div className="missed-grid">
                  {missed.map((entity) => <span key={entity.code}>{entity.name}</span>)}
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </div>
  )
}
