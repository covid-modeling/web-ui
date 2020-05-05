import {input} from '@covid-modeling/api'
import {DateTime} from 'luxon'

type Props = {
  isoDate: input.ISODate
}

export default function LocalDate(props: Props) {
  return (
    <time dateTime={props.isoDate} suppressHydrationWarning>
      {DateTime.fromISO(props.isoDate).toLocaleString({
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}
    </time>
  )
}
