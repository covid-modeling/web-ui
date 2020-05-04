import {CleaveOptions} from 'cleave.js/options'
import Cleave from 'cleave.js/react'
import {useMemo, useState} from 'react'
import {isValidDate, toYYYYMMDD} from '../../lib/dateFunctions'
import formStyle from '../styles/form.module.css'

interface Props {
  value: string | Date
  max?: string | Date
  min?: string | Date
  onChange?: (newDate: string) => void
}

/**
 * A component that displays a platform native date picker
 * and allows a user to choose a date within a given range.
 *
 * Dates are expected and returned in yyyy-mm-dd format.
 *
 */
export default function DateInput(props: Props): JSX.Element {
  const [error, setError] = useState(false)
  const value: string = useMemo(
    () => (props.value instanceof Date ? toYYYYMMDD(props.value) : props.value),
    [props.value]
  )
  const min: string | undefined = useMemo(
    () => (props.min instanceof Date ? toYYYYMMDD(props.min) : props.min),
    [props.min]
  )
  const max: string | undefined = useMemo(
    () => (props.max instanceof Date ? toYYYYMMDD(props.max) : props.max),
    [props.max]
  )
  return (
    <Cleave
      key={`cleave-${props.min?.toString()}`} // Cleave has a bug that caches `min`
      className={`${formStyle.textInput} w-full ${
        error ? formStyle.error : ''
      }`}
      value={value}
      min={min}
      placeholder="YYYY-MM-DD"
      onChange={e => {
        props.onChange && props.onChange(e.target.value)
        setError(!isValidDate(e.target.value))
      }}
      options={
        {
          date: true,
          datePattern: ['Y', 'm', 'd'],
          delimiters: ['-'],
          dateMin: min,
          dateMax: max
        } as CleaveOptions // DefinitelyTyped def is out of date
      }
    />
  )
}
