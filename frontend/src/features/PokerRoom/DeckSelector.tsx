import { DECKS, type DeckType } from '@e2poker/shared'

type DeckSelectorProps = {
  currentDeck: DeckType
  selectedVote: string | null
  revealed: boolean
  isSpectator: boolean
  onVote: (value: string) => void
  onChangeDeck: (deck: DeckType) => void
}

const DECK_LABELS: Record<DeckType, string> = {
  fibonacci: 'Fibonacci',
  tshirt: 'T-Shirt',
  fivefinger: 'Five Finger',
  roman: 'Roman Voting',
}

export function DeckSelector({
  currentDeck,
  selectedVote,
  revealed,
  isSpectator,
  onVote,
  onChangeDeck,
}: DeckSelectorProps) {
  const deckTypes: DeckType[] = ['fibonacci', 'tshirt', 'fivefinger', 'roman']

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center gap-6 shadow-xl transition-colors">
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl gap-2 shadow-inner">
        {deckTypes.map((deckType) => (
          <button
            key={deckType}
            type="button"
            onClick={() => onChangeDeck(deckType)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
              currentDeck === deckType
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                : 'text-slate-400'
            }`}
          >
            {DECK_LABELS[deckType]}
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pt-6 pb-4 max-w-full justify-center px-4">
        {DECKS[currentDeck].map((value) => {
          const isSelected = selectedVote === value
          const isDisabled = revealed || isSpectator

          return (
            <button
              key={value}
              type="button"
              onClick={() => !isDisabled && onVote(value)}
              disabled={isDisabled}
              className={`w-16 h-24 shrink-0 rounded-2xl flex items-center justify-center text-xl font-black transition-all transform ${
                isSelected
                  ? 'border-2 border-primary bg-primary text-white -translate-y-4 shadow-xl shadow-primary/30'
                  : 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-md'
              } ${
                !isDisabled && !isSelected ? 'hover:-translate-y-4 hover:shadow-2xl' : ''
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {value}
            </button>
          )
        })}
      </div>
    </footer>
  )
}
