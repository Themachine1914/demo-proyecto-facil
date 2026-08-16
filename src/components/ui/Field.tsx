import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { formatGrouped } from '../../lib/format'
import { parseAmount } from '../../lib/parse'

const controlClass =
  'w-full rounded-[10px] border border-facil-border bg-white px-3 py-2.5 text-sm text-facil-text outline-none transition focus:border-facil-accent focus:ring-2 focus:ring-facil-accent/20'

function Label({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-facil-text">{label}</span>
      {children}
    </label>
  )
}

export function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Label label={label}>
      <input {...props} className={`${controlClass} ${props.className ?? ''}`} />
    </Label>
  )
}

export function TextAreaField({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Label label={label}>
      <textarea
        rows={3}
        {...props}
        className={`${controlClass} resize-y ${props.className ?? ''}`}
      />
    </Label>
  )
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Label label={label}>
      <select {...props} className={`${controlClass} ${props.className ?? ''}`}>
        {children}
      </select>
    </Label>
  )
}

export function MoneyField({
  label,
  value,
  onValueChange,
  required,
  placeholder = '0',
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  required?: boolean
  placeholder?: string
}) {
  const display = value.trim() === '' ? '' : formatGrouped(parseAmount(value))

  return (
    <Field
      label={label}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      required={required}
      placeholder={placeholder}
      value={display}
      onChange={(event) => {
        if (event.target.value.trim() === '') {
          onValueChange('')
          return
        }
        onValueChange(String(parseAmount(event.target.value)))
      }}
      className="tabular-nums"
    />
  )
}
