import styles from './RangeInput.module.css'

type Props = {
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
}

export default function RangeInput(props: Props) {
  // handle the case where the min/max has changed
  if (props.value < props.min) {
    props.onChange(props.min)
  }
  if (props.value > props.max) {
    props.onChange(props.max)
  }

  return (
    <div className={styles.RangeInput}>
      <input
        type="number"
        min={props.min}
        max={props.max}
        step="1"
        disabled={props.disabled}
        value={props.value}
        onChange={e => {
          const value = parseValue(e.target.value, props.min, props.max)
          props.onChange(value)
        }}
      />
      <input
        type="range"
        min={props.min}
        max={props.max}
        step="1"
        disabled={props.disabled}
        value={props.value}
        onChange={e => {
          const value = parseValue(e.target.value, props.min, props.max)
          props.onChange(value)
        }}
      />
    </div>
  )
}

function parseValue(value: string, min: number, max: number): number {
  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    return min
  }

  if (parsed < min) {
    return min
  }

  if (parsed > max) {
    return max
  }

  return parsed
}
