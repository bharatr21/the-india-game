type Props = {
  hard: boolean
  onChange: (hard: boolean) => void
}

export default function DifficultySwitch({ hard, onChange }: Props) {
  return (
    <div className="difficulty-switch" aria-label="Difficulty">
      <button className={!hard ? 'active' : ''} onClick={() => onChange(false)}>STANDARD</button>
      <button className={hard ? 'active' : ''} onClick={() => onChange(true)}>HARD: +CAPITAL</button>
    </div>
  )
}
