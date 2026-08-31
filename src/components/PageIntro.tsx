export type Accent = 'red' | 'blue' | 'yellow'

type Props = {
  number: string
  title: string
  description: string
  accent?: Accent
}

export default function PageIntro({ number, title, description, accent = 'red' }: Props) {
  return (
    <div className={`page-intro ${accent}`}>
      <span className="page-number">/{number}</span>
      <div>
        <p className="eyebrow">TRAINING MODULE</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  )
}
