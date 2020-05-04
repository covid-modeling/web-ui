import {DateTime} from 'luxon'
import {ISODate} from '../types/model-runner'

type Props = {
  isoDate: ISODate
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
