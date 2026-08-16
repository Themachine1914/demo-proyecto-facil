import { suggestedPhysicalProgress } from '../../lib/finance'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { ProgressBar } from '../ui/ProgressBar'

export function ProgressSection({
  physicalProgress,
  materialsPurchased,
  materialsBudget,
  onApplySuggestion,
  onChange,
}: {
  physicalProgress: number
  materialsPurchased: number
  materialsBudget: number
  onApplySuggestion: (value: number) => Promise<void>
  onChange: (value: number) => void
}) {
  const suggestion = suggestedPhysicalProgress(materialsPurchased, materialsBudget)

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-facil-text-secondary">Avance físico</span>
          <span className="font-semibold">{Math.round(physicalProgress)}%</span>
        </div>
        <ProgressBar value={physicalProgress} className="h-2.5" />
      </div>
      <Field
        label="Porcentaje (editable)"
        type="range"
        min="0"
        max="100"
        value={physicalProgress}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {suggestion !== null && (
        <div className="rounded-[10px] bg-facil-bg px-3 py-3 text-xs text-facil-text-secondary">
          Sugerencia según materiales comprados: <strong>{suggestion}%</strong>
          <Button
            variant="secondary"
            className="mt-2 w-full !min-h-[40px]"
            onClick={() => void onApplySuggestion(suggestion)}
          >
            Usar sugerencia
          </Button>
        </div>
      )}
    </div>
  )
}
